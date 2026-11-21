const ENDPOINT = 'https://saaristolautat.goatcounter.com/count';
const SCRIPT_URL = 'https://gc.zgo.at/count.js';
const MAX_QUEUE_LENGTH = 100;
const APP_VERSION = import.meta.env?.VITE_APP_VERSION || 'development';

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

function usageMode() {
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  return standalone ? 'installed' : 'browser';
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
  enqueue({
    path: `${currentEnvironment}/client/version/${safeSegment(APP_VERSION)}`,
    title: `Sovellusversio: ${APP_VERSION}`,
    event: true,
  });
  const mode = usageMode();
  enqueue({
    path: `${currentEnvironment}/client/mode/${mode}`,
    title: mode === 'installed' ? 'Asennettu sovellus' : 'Selainkäyttö',
    event: true,
  });
  loadScript();
  window.addEventListener('online', () => {
    loadScript();
    flushQueue();
  });
}

function trackEventWithSession(path, title, countEveryTime) {
  const currentEnvironment = environment();
  if (!currentEnvironment) return;
  enqueue({
    path: `${currentEnvironment}/${path.split('/').map(safeSegment).join('/')}`,
    title,
    event: true,
    ...(countEveryTime ? { no_session: true } : {}),
  });
  loadScript();
}

export function trackEvent(path, title) {
  trackEventWithSession(path, title, true);
}

export function trackSessionEvent(path, title) {
  trackEventWithSession(path, title, false);
}

export function initSettingsAnalytics(store) {
  let previous = store.getState().settings;
  trackSessionEvent(`client/map/initial/${previous.mapTypeId}`, `Kartta käynnistettäessä: ${previous.mapTypeId}`);
  trackSessionEvent(`client/language/initial/${previous.locale}`, `Kieli käynnistettäessä: ${previous.locale}`);

  store.subscribe(() => {
    const current = store.getState().settings;
    if (current.mapTypeId !== previous.mapTypeId) {
      trackEvent(`client/map/change/${current.mapTypeId}`, `Kartta vaihdettu: ${current.mapTypeId}`);
    }
    if (current.locale !== previous.locale) {
      trackEvent(`client/language/change/${current.locale}`, `Kieli vaihdettu: ${current.locale}`);
    }
    previous = current;
  });
}
