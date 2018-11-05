const localStorgageLayers = localStorage.getItem("layers");

export const layers = localStorgageLayers ? JSON.parse(localStorgageLayers) : {
  ringroads: false,
  distances: true,
  roadferries: true,
  conn4: true,
  conn5: false,
  longdistanceferries: false,
  live: false,
};

localStorage.setItem("layers", JSON.stringify(layers));

export default function reducer(state = {
  locale: "fi",
  isFullScreen: false,
  layers: layers
}, action) {
  switch (action.type) {
    case "LOCALE_SET":
      return { ...state, locale: action.payload };
    case "FULLSCREEN_CHANGED":
      return { ...state, isFullScreen: action.payload };
    case "LAYER_SET":
      const layers = Object.assign({}, state.layers, action.payload);
      localStorage.setItem("layers", JSON.stringify(layers));
      return { ...state, layers: layers };
    default:
      return state;
  }
}
