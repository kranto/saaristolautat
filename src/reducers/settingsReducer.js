export default function reducer(state={
  locale: "fi",
  isFullScreen: false,
}, action) {
  switch(action.type) {
    case "LOCALE_SET":
      return {...state, locale: action.payload};
    case "FULLSCREEN_CHANGED":
      return {...state, isFullScreen: action.payload};
    default:
      return state;
  }
}
