const APP_CACHE = 'saaristolautat-app-__VERSION__';
const PRECACHE = __PRECACHE__;

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
