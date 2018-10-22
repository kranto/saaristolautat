export default function reducer(state={
  locale: "fi",
}, action) {
  switch(action.type) {
    case "LOCALE_SET":
      return {...state, locale: action.payload};
    default:
      return state;
  }
}
