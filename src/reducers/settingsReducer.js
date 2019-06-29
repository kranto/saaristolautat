let initialSettings = getFromLocalStorage("settings") ||
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
  mapTypeId: 'roadmap'
};

initialSettings = {...initialSettings, isFullScreen: false};

setToLocalStorage("settings", initialSettings);

export default function reducer(state = initialSettings, action) {
  const newState = handleAction(state, action);
  setToLocalStorage("settings", newState);
  return newState;
}

function handleAction(state, action) {
  switch (action.type) {
    case "LOCALE_SET":
      setToLocalStorage('language', action.payload);
      return { ...state, locale: action.payload };
    case "FULLSCREEN_CHANGED":
      return { ...state, isFullScreen: action.payload };
    case "LAYER_SET":
      const layers = Object.assign({}, state.layers, action.payload);
      setToLocalStorage("layers", JSON.stringify(layers));
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