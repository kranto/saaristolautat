import store from '../store';

const SNAPSHOT_CACHE = 'saaristolautat-data-v1';
const SNAPSHOT_URL = '/offline-data-snapshot';
const DATA_BASE = '/data/';
const REQUEST_TIMEOUT_MS = 12000;

async function getJson(uri, signal) {
  const response = await fetch(uri, { signal });
  if (!response.ok) throw new Error(`Failed to load ${uri}: ${response.status} ${response.statusText}`);
  return response.json();
}

async function loadFromNetwork() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const index = await getJson(`${DATA_BASE}index.json?v=${Date.now()}`, controller.signal);
    if (!index?.data || !Array.isArray(index.geojson)) throw new Error('Invalid data index');
    const [data, geojson] = await Promise.all([
      getJson(DATA_BASE + index.data, controller.signal),
      Promise.all(index.geojson.map(uri => getJson(DATA_BASE + uri, controller.signal)))
    ]);
    return { data, geojson, dataVersion: index.data.split('?v=')[1] || '', savedAt: Date.now() };
  } finally {
    clearTimeout(timeout);
  }
}

async function saveSnapshot(snapshot) {
  if (!('caches' in window)) return;
  const cache = await caches.open(SNAPSHOT_CACHE);
  await cache.put(SNAPSHOT_URL, new Response(JSON.stringify(snapshot), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

async function loadSnapshot() {
  if (!('caches' in window)) return null;
  const cache = await caches.open(SNAPSHOT_CACHE);
  const response = await cache.match(SNAPSHOT_URL);
  if (!response) return null;
  const snapshot = await response.json();
  return snapshot?.data && Array.isArray(snapshot.geojson) && Number.isFinite(snapshot.savedAt)
    ? snapshot : null;
}

function applyData(snapshot, offline) {
  store.dispatch({ type: 'DATA_VERSION', payload: snapshot.dataVersion });
  store.dispatch({ type: 'LOADING_DATA_FULFILLED', payload: { data: snapshot.data } });
  store.dispatch({ type: 'LOADING_GEOJSON_FULFILLED', payload: snapshot.geojson.map(data => ({ data })) });
  store.dispatch({ type: 'DATA_CACHE_STATUS', payload: { offline, savedAt: snapshot.savedAt } });
}

async function loadDataOnce() {
  try {
    const snapshot = await loadFromNetwork();
    applyData(snapshot, false);
    try {
      await saveSnapshot(snapshot);
    } catch (error) {
      console.warn('Could not save offline data', error);
    }
  } catch (error) {
    if (store.getState().data.offline) return;
    console.warn('Network data unavailable; trying offline copy', error);
    try {
      const snapshot = await loadSnapshot();
      if (snapshot) {
        applyData(snapshot, true);
        return;
      }
    } catch (cacheError) {
      console.error('Could not read offline data', cacheError);
    }
    store.dispatch({ type: 'DATA_LOAD_FAILED' });
  }
}

let pendingLoad;
function loadData() {
  if (!pendingLoad) pendingLoad = loadDataOnce().finally(() => { pendingLoad = null; });
  return pendingLoad;
}

const retryOfflineData = () => {
  const { offline, loadFailed } = store.getState().data;
  if (offline || loadFailed) loadData();
};

window.addEventListener('online', retryOfflineData);
window.addEventListener('focus', retryOfflineData);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) retryOfflineData();
});
window.setInterval(retryOfflineData, 30000);
loadData();
