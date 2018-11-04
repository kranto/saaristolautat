export default function reducer(state = {
  timetables: null,
}, action) {
  switch (action.type) {
    case "TIMETABLE_OPENED":
      return { ...state, timetables: action.payload };
    case "TIMETABLE_CLOSED":
      return { ...state, timetables: null };
    case "INFOCONTENT_SELECTED":
      return { ...state, infoContent: action.payload };
    case "INFOCONTENT2_SELECTED":
      return { ...state, infoContent2: action.payload };
      case "INFOCONTENT_UNSELECTED":
      return { ...state, infoContent: null, infoContent2: null };
    default:
      return state;
  }
}