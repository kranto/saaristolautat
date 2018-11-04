export default function reducer(state = {
  timetables: null,
}, action) {
  switch (action.type) {
    case "TIMETABLE_OPENED":
      return { ...state, timetables: action.payload };
    case "TIMETABLE_CLOSED":
      return { ...state, timetables: null };
    case "ROUTE_SELECTED":
      return { ...state, selected: action.payload };
    default:
      return state;
  }
}