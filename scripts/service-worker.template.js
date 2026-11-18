const APP_CACHE = 'saaristolautat-app-__VERSION__';
const PRECACHE = __PRECACHE__;
const TIMETABLE_CACHE = 'saaristolautat-timetables-v1';
const TIMETABLE_METADATA_URL = '/offline-timetable-metadata';
const TIMETABLE_MAX_BYTES = 10 * 1024 * 1024;
const isTimetableImage = pathname => /^\/data\/timetables_jpg\/[^/]+\.(?:jpe?g|png)$/i.test(pathname);

let timetableOperation = Promise.resolve();
function serializeTimetable(operation) {
  const result = timetableOperation.then(operation, operation);
  timetableOperation = result.catch(() => {});
  return result;
}

async function readTimetableMetadata(cache) {
  try {
    const response = await cache.match(TIMETABLE_METADATA_URL);
    const metadata = response && await response.json();
    if (metadata?.entries && Number.isFinite(metadata.latestOpened)) return metadata;
  } catch (error) {
    console.warn('Could not read timetable metadata', error);
  }
  return { entries: {}, latestOpened: 0 };
}

async function saveTimetableMetadata(cache, metadata) {
  await cache.put(TIMETABLE_METADATA_URL, new Response(JSON.stringify(metadata), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

function touchTimetable(metadata, url, size) {
  metadata.latestOpened = Math.max(Date.now(), metadata.latestOpened + 1);
  metadata.entries[url] = { size, lastOpened: metadata.latestOpened };
}

async function reconcileTimetableMetadata(cache, metadata) {
  const keys = (await cache.keys()).filter(request => isTimetableImage(new URL(request.url).pathname));
  const urls = new Set(keys.map(request => request.url));
  for (const url of Object.keys(metadata.entries)) {
    if (!urls.has(url)) delete metadata.entries[url];
  }
  for (const request of keys) {
    if (metadata.entries[request.url]) continue;
    const response = await cache.match(request);
    metadata.entries[request.url] = { size: (await response.blob()).size, lastOpened: 0 };
  }
}

async function serveTimetableImage(request) {
  const cache = await caches.open(TIMETABLE_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    try {
      const metadata = await readTimetableMetadata(cache);
      const size = metadata.entries[request.url]?.size ?? (await cached.clone().blob()).size;
      touchTimetable(metadata, request.url, size);
      await saveTimetableMetadata(cache, metadata);
    } catch (error) {
      console.warn('Could not update timetable recency', error);
    }
    return cached;
  }

  const response = await fetch(request);
  if (!response.ok || !response.headers.get('Content-Type')?.startsWith('image/')) return response;
  try {
    const size = (await response.clone().blob()).size;
    if (size > TIMETABLE_MAX_BYTES) return response;
    const metadata = await readTimetableMetadata(cache);
    await reconcileTimetableMetadata(cache, metadata);
    let total = Object.values(metadata.entries).reduce((sum, entry) => sum + entry.size, 0);
    while (total + size > TIMETABLE_MAX_BYTES) {
      const [oldestUrl, oldest] = Object.entries(metadata.entries)
        .sort((a, b) => a[1].lastOpened - b[1].lastOpened)[0];
      await cache.delete(oldestUrl);
      delete metadata.entries[oldestUrl];
      total -= oldest.size;
    }
    await cache.put(request, response.clone());
    touchTimetable(metadata, request.url, size);
    await saveTimetableMetadata(cache, metadata);
  } catch (error) {
    console.warn('Could not cache timetable image', error);
  }
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    await cache.addAll(PRECACHE);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('saaristolautat-app-') && name !== APP_CACHE)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (isTimetableImage(url.pathname)) {
    event.respondWith(serializeTimetable(() => serveTimetableImage(request)));
    return;
  }

  if (request.mode === 'navigate' && (url.pathname === '/' || url.pathname === '/index.html')) {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch {
        return (await caches.open(APP_CACHE)).match('/index.html');
      }
    })());
    return;
  }

  if (!PRECACHE.includes(url.pathname)) return;
  event.respondWith((async () => {
    const cached = await (await caches.open(APP_CACHE)).match(url.pathname);
    return cached || fetch(request);
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type !== 'TIMETABLE_OPENED') return;
  const url = new URL(event.data.url, self.location.origin);
  if (url.origin !== self.location.origin || !isTimetableImage(url.pathname)) return;
  event.waitUntil(serializeTimetable(async () => {
    const cache = await caches.open(TIMETABLE_CACHE);
    const response = await cache.match(url.href);
    if (!response) return;
    const metadata = await readTimetableMetadata(cache);
    const size = metadata.entries[url.href]?.size ?? (await response.blob()).size;
    touchTimetable(metadata, url.href, size);
    await saveTimetableMetadata(cache, metadata);
  }));
});
