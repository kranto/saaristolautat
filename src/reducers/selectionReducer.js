export default function reducer(state={
  timetables: null,
}, action) {
  switch(action.type) {
    case "TIMETABLE_OPENED":
      return {...state, timetables: action.payload};
    case "TIMETABLE_CLOSED":
      return {...state, timetables: null};
    default:
      return state;
  }
}