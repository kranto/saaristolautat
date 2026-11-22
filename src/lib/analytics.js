const GOATCOUNTER_ENDPOINT = 'https://saaristolautat.goatcounter.com/count';
const GOATCOUNTER_SCRIPT_URL = 'https://gc.zgo.at/count.js';
const UMAMI_SCRIPT_URL = import.meta.env?.VITE_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js';
const UMAMI_WEBSITE_ID = import.meta.env?.VITE_UMAMI_WEBSITE_ID || '6d0b3cd2-13e7-4bb4-9bb0-99b9e57ad936';
const MAX_QUEUE_LENGTH = 100;
const APP_VERSION = import.meta.env?.VITE_APP_VERSION || 'development';

const goatCounterQueue = [];
const umamiQueue = [];
let goatCounterLoading = false;
let goatCounterLoaded = false;
let umamiLoading = false;
let umamiLoaded = false;

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

function sendGoatCounter(item) {
  if (!goatCounterLoaded || !window.goatcounter?.count || !navigator.onLine) return false;
  try {
    window.goatcounter.count(item);
    return true;
  } catch (error) {
    console.warn('GoatCounter event could not be sent', error);
    return false;
  }
}

function flushGoatCounterQueue() {
  if (!goatCounterLoaded || !navigator.onLine) return;
  while (goatCounterQueue.length > 0) {
    if (!sendGoatCounter(goatCounterQueue[0])) return;
    goatCounterQueue.shift();
  }
}

function enqueueGoatCounter(item) {
  if (sendGoatCounter(item)) return;
  if (goatCounterQueue.length === MAX_QUEUE_LENGTH) goatCounterQueue.shift();
  goatCounterQueue.push(item);
}

function loadGoatCounterScript() {
  if (!environment() || goatCounterLoading || goatCounterLoaded || !navigator.onLine) return;
  goatCounterLoading = true;
  window.goatcounter = { no_onload: true, no_events: true };
  const script = document.createElement('script');
  script.async = true;
  script.src = GOATCOUNTER_SCRIPT_URL;
  script.dataset.goatcounter = GOATCOUNTER_ENDPOINT;
  script.dataset.goatcounterSettings = JSON.stringify({ no_onload: true, no_events: true });
  script.addEventListener('load', () => {
    goatCounterLoading = false;
    goatCounterLoaded = true;
    flushGoatCounterQueue();
  });
  script.addEventListener('error', () => {
    goatCounterLoading = false;
  });
  document.head.appendChild(script);
}

function sendUmami(item) {
  if (!umamiLoaded || !window.umami?.track || !navigator.onLine) return false;
  try {
    window.umami.track(item.name, item.data);
    return true;
  } catch (error) {
    console.warn('Umami event could not be sent', error);
    return false;
  }
}

function flushUmamiQueue() {
  if (!umamiLoaded || !navigator.onLine) return;
  while (umamiQueue.length > 0) {
    if (!sendUmami(umamiQueue[0])) return;
    umamiQueue.shift();
  }
}

function enqueueUmami(item) {
  if (!item || sendUmami(item)) return;
  if (umamiQueue.length === MAX_QUEUE_LENGTH) umamiQueue.shift();
  umamiQueue.push(item);
}

function loadUmamiScript() {
  if (!environment() || !UMAMI_SCRIPT_URL || !UMAMI_WEBSITE_ID || umamiLoading || umamiLoaded || !navigator.onLine) return;
  umamiLoading = true;
  const script = document.createElement('script');
  script.defer = true;
  script.src = UMAMI_SCRIPT_URL;
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  script.addEventListener('load', () => {
    umamiLoading = false;
    umamiLoaded = true;
    flushUmamiQueue();
  });
  script.addEventListener('error', () => {
    umamiLoading = false;
  });
  document.head.appendChild(script);
}

function umamiEvent(path) {
  const segments = path.split('/');
  if (segments[0] === 'route' && segments.length >= 3) {
    return { name: 'route-open', data: { source: segments[1], route: segments.slice(2).join('/') } };
  }
  if (segments[0] === 'timetable' && segments.length >= 3) {
    return { name: 'timetable-open', data: { route: segments[1], timetable: segments.slice(2).join('/') } };
  }
  if (segments[0] === 'live' && ['on', 'off'].includes(segments[1])) {
    return { name: 'live', data: { state: segments[1] } };
  }
  if (segments[0] === 'client' && segments.length >= 3) {
    const [, setting, action, ...valueParts] = segments;
    const value = valueParts.join('/');
    if (setting === 'map') return { name: `map-${action}`, data: { map: value } };
    if (setting === 'language') return { name: `language-${action}`, data: { language: value } };
  }
  return { name: 'interaction', data: { path } };
}

export function initAnalytics() {
  const currentEnvironment = environment();
  if (!currentEnvironment) return;
  enqueueGoatCounter({
    path: `/${currentEnvironment}${window.location.pathname}`,
    title: document.title,
    referrer: document.referrer,
  });
  enqueueGoatCounter({
    path: `${currentEnvironment}/client/version/${safeSegment(APP_VERSION)}`,
    title: `Sovellusversio: ${APP_VERSION}`,
    event: true,
  });
  const mode = usageMode();
  enqueueGoatCounter({
    path: `${currentEnvironment}/client/mode/${mode}`,
    title: mode === 'installed' ? 'Asennettu sovellus' : 'Selainkäyttö',
    event: true,
  });
  loadGoatCounterScript();
  loadUmamiScript();
  window.addEventListener('online', () => {
    loadGoatCounterScript();
    loadUmamiScript();
    flushGoatCounterQueue();
    flushUmamiQueue();
  });
}

function trackGoatCounterEvent(path, title, countEveryTime) {
  const currentEnvironment = environment();
  if (!currentEnvironment) return;
  enqueueGoatCounter({
    path: `${currentEnvironment}/${path.split('/').map(safeSegment).join('/')}`,
    title,
    event: true,
    ...(countEveryTime ? { no_session: true } : {}),
  });
  loadGoatCounterScript();
}

function trackEventWithSession(path, title, countEveryTime) {
  if (!environment()) return;
  trackGoatCounterEvent(path, title, countEveryTime);
  enqueueUmami(umamiEvent(path));
  loadUmamiScript();
}

export function trackEvent(path, title) {
  trackEventWithSession(path, title, true);
}

export function initSettingsAnalytics(store) {
  let previous = store.getState().settings;
  const mode = usageMode();
  const live = previous.layers.live ? 'on' : 'off';
  trackGoatCounterEvent(`client/map/initial/${previous.mapTypeId}`, `Kartta käynnistettäessä: ${previous.mapTypeId}`, false);
  trackGoatCounterEvent(`client/language/initial/${previous.locale}`, `Kieli käynnistettäessä: ${previous.locale}`, false);
  trackGoatCounterEvent(`client/live/initial/${live}`, `Live-seuranta käynnistettäessä: ${live}`, false);
  enqueueUmami({
    name: 'app-start',
    data: {
      version: APP_VERSION,
      usageMode: mode,
      language: previous.locale,
      map: previous.mapTypeId,
      live,
    },
  });
  loadUmamiScript();

  store.subscribe(() => {
    const current = store.getState().settings;
    if (current.mapTypeId !== previous.mapTypeId) {
      trackEvent(`client/map/change/${current.mapTypeId}`, `Kartta vaihdettu: ${current.mapTypeId}`);
    }
    if (current.locale !== previous.locale) {
      trackEvent(`client/language/change/${current.locale}`, `Kieli vaihdettu: ${current.locale}`);
    }
    if (current.layers.live !== previous.layers.live) {
      const state = current.layers.live ? 'on' : 'off';
      trackEvent(`live/${state}`, `Live-seuranta: ${state}`);
    }
    previous = current;
  });
}
