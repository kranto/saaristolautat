const SETTINGS_STORAGE_KEY = "settings-v2";
const savedSettings = getFromLocalStorage(SETTINGS_STORAGE_KEY);

let initialSettings = savedSettings || getFromLocalStorage("settings") ||
{
  layers: {
    ringroads: false,
    distances: true,
    roadferries: true,
    conn4: true,
    conn5: true,
    longdistanceferries: false,
    live: false,
  },
  locale: window.navigator.language.split("-")[0] || "fi",
  mapTypeId: 'openfreemap'
};

// fix unsupported locales (de etc.)
const locales = ["fi", "sv", "en"];
if (locales.indexOf(initialSettings.locale) < 0) {
  initialSettings.locale = "en"
}

initialSettings = {...initialSettings, isFullScreen: false};

// Migrate saved settings for retired map types to the default base map.
if (!["openfreemap", "OSM"].includes(initialSettings.mapTypeId)) {
  initialSettings.mapTypeId = 'openfreemap';
}

// Write once when migrating from the legacy key. Normal reloads must not let a
// stale tab overwrite settings that were changed in another tab.
if (!savedSettings) setToLocalStorage(SETTINGS_STORAGE_KEY, initialSettings);

export default function reducer(state = initialSettings, action) {
  const newState = handleAction(state, action);
  persistSettingChange(action, newState);
  return newState;
}

function persistSettingChange(action, state) {
  if (!["LOCALE_SET", "LAYER_SET", "MAP_TYPE_SELECTED"].includes(action.type)) return;
  const saved = getFromLocalStorage(SETTINGS_STORAGE_KEY) || {};
  let nextSettings = saved;
  if (action.type === "LOCALE_SET") {
    nextSettings = { ...saved, locale: state.locale };
  } else if (action.type === "LAYER_SET") {
    nextSettings = { ...saved, layers: { ...(saved.layers || state.layers), ...action.payload } };
  } else if (action.type === "MAP_TYPE_SELECTED") {
    nextSettings = { ...saved, mapTypeId: state.mapTypeId };
  }
  setToLocalStorage(SETTINGS_STORAGE_KEY, nextSettings);
}

function handleAction(state, action) {
  switch (action.type) {
    case "LOCALE_SET":
      return { ...state, locale: action.payload };
    case "FULLSCREEN_CHANGED":
      return { ...state, isFullScreen: action.payload };
    case "LAYER_SET":
      const layers = Object.assign({}, state.layers, action.payload);
      return { ...state, layers: layers };
    case "MAP_TYPE_SELECTED":
      return { ...state, mapTypeId: action.payload };
    default:
      return state;
  }
}

function getFromLocalStorage(item) {
  if (typeof Storage !== 'undefined') {
    const value = localStorage.getItem(item);
    if (typeof value !== 'undefined') {
      return JSON.parse(value);
    }
  }
  return null;
}

function setToLocalStorage(item, value) {
  if (typeof Storage !== 'undefined') {
    localStorage.setItem(item, JSON.stringify(value));
  }
}
