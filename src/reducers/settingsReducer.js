export default function reducer(state={
  locale: "fi",
}, action) {
  console.log('action', action);
  switch(action.type) {
    case "LOCALE_SET":
      console.log('state changed ', action.payload);
      return {...state, locale: action.payload};
    default:
      return state;
  }
}
