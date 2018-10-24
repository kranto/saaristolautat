export default function reducer(state={
  msg: null,
}, action) {
  switch(action.type) {
    case "UPDATE_INDICATOR_MSG":
      return {...state, msg: action.payload};
    default:
      return state;
  }
}