
function searchPhrase(phrase) {
  console.log('reducing', phrase);
  return [{title: "Utön reitti", type: "reitti", description: "Yhteysalus", ref: "utorutt"}, {title: "Jurmo", type: "saari", description: "Saari Korppoossa", ref: "kivimo"}];
}

export default function reducer(state = {
  phrase: '',
  results: []
}, action) {
  switch (action.type) {
    case "SEARCH_PHRASE_EDITED":
      return { ...state, phrase: action.payload, results: searchPhrase(action.payload) };
    default:
      return state;
  }
}