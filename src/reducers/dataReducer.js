export default function reducer(state = {
  data: {},
  geojson: [],
  offline: false,
  savedAt: null,
  loadFailed: false
}, action) {
  switch (action.type) {
    case "DATA_VERSION":
      return { ...state, dataVersion: action.payload };
    case "LOADING_DATA_FULFILLED":
      return { ...state, data: action.payload.data };
    case "LOADING_GEOJSON_FULFILLED":
      return { ...state, geojson: action.payload.map(resp => resp.data) };
    case "DATA_CACHE_STATUS":
      return { ...state, ...action.payload, loadFailed: false };
    case "DATA_LOAD_FAILED":
      return { ...state, loadFailed: true };
    default:
      return state;
  }
}
