export default function reducer(state = {
  data: {},
  geojson: []
}, action) {
  switch (action.type) {
    case "LOADING_DATA_FULFILLED":
      return { ...state, data: action.payload.data };
    case "LOADING_GEOJSON_FULFILLED":
      return { ...state, geojson: action.payload.map(resp => resp.data) };
    default:
      return state;
  }
}
