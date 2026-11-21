const ENDPOINT = 'https://saaristolautat.goatcounter.com/count';
const SCRIPT_URL = 'https://gc.zgo.at/count.js';
const MAX_QUEUE_LENGTH = 100;

const queue = [];
let loading = false;
let loaded = false;

function environment() {
  if (window.location.hostname === 'test.saaristolautat.fi') return 'test';
  if (['saaristolautat.fi', 'www.saaristolautat.fi'].includes(window.location.hostname)) return 'production';
  return null;
}

function safeSegment(value) {
  return encodeURIComponent(String(value ?? '').trim()).replaceAll('%2F', '-');
}

function send(item) {
  if (!loaded || !window.goatcounter?.count || !navigator.onLine) return false;
  try {
    window.goatcounter.count(item);
    return true;
  } catch (error) {
    console.warn('Analytics event could not be sent', error);
    return false;
  }
}

function flushQueue() {
  if (!loaded || !navigator.onLine) return;
  while (queue.length > 0) {
    if (!send(queue[0])) return;
    queue.shift();
  }
}

function enqueue(item) {
  if (send(item)) return;
  if (queue.length === MAX_QUEUE_LENGTH) queue.shift();
  queue.push(item);
}

function loadScript() {
  if (!environment() || loading || loaded || !navigator.onLine) return;
  loading = true;
  window.goatcounter = { no_onload: true, no_events: true };
  const script = document.createElement('script');
  script.async = true;
  script.src = SCRIPT_URL;
  script.dataset.goatcounter = ENDPOINT;
  script.dataset.goatcounterSettings = JSON.stringify({ no_onload: true, no_events: true });
  script.addEventListener('load', () => {
    loading = false;
    loaded = true;
    flushQueue();
  });
  script.addEventListener('error', () => {
    loading = false;
  });
  document.head.appendChild(script);
}

export function initAnalytics() {
  const currentEnvironment = environment();
  if (!currentEnvironment) return;
  enqueue({
    path: `/${currentEnvironment}${window.location.pathname}`,
    title: document.title,
    referrer: document.referrer,
  });
  loadScript();
  window.addEventListener('online', () => {
    loadScript();
    flushQueue();
  });
}

export function trackEvent(path, title) {
  const currentEnvironment = environment();
  if (!currentEnvironment) return;
  enqueue({
    path: `${currentEnvironment}/${path.split('/').map(safeSegment).join('/')}`,
    title,
    event: true,
    no_session: true,
  });
  loadScript();
}
