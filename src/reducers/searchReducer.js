
function searchPhrase(phrase) {
  console.log('reducing', phrase);
  return [
    {title: "Utön reitti", type: "reitti", description: "Yhteysalus", ref: "utorutt"},
    {title: "Kivimo", type: "saari", description: "Saari Korppoossa", ref: "kivimo"},
    {title: "Houtskarin reitti", type: "saari", description: "Saari Korppoossa", ref: "houtskarrutt"},
    {title: "Pohjoinen linja: Hummelvik - Torsholma", type: "saari", description: "Saari Korppoossa", ref: "norralinjen"},
    {title: "Pohjoinen linja: Vuosnainen - Åva", type: "saari", description: "Saari Korppoossa", ref: "osnasava"},
  ];
}

export default function reducer(state = {
  phrase: '',
  results: []
}, action) {
  switch (action.type) {
    case "SEARCH_PHRASE_EDITED":
      return { ...state, phrase: action.payload, results: searchPhrase(action.payload) };
    // case "MENU_AND_SETTINGS_HIDDEN":
    //   return { ...state, phrase: '', results: [] };
    default:
      return state;
  }
}