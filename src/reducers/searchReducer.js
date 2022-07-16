import { LP } from "../lib/localizer";

let rawData = null;
let searchData = [];

function canonizeName(name) {
  return name.trim().toLowerCase().replace("å", "a").replace("ä", "a").replace("ö", "o");
}

function routeSearchStrings(route) {
  return [canonizeName(LP(route,"name"))];
}

function vesselSearchStrings(vessel) {
  const vStr = canonizeName(vessel.name);
  const withoutPrefix = vStr.match(/^.\/. /) ? [vStr.substring(4)] : [];
  return [vStr, ...withoutPrefix];
}

function pierSearchStrings(pier) {
  return [canonizeName(pier.name)];
}

function initData(data) {
  if (searchData.length > 0) return searchData;

  console.log('----------- init ------------')
  const routes = data.data.routes;

  const routeData = [];
  const pierData = [];
  const vesselData = [];

  Object.values(routes).filter(route => !route.obsolete).forEach(route => {
    routeData.push({search: routeSearchStrings(route), title: LP(route,"name"), specifier: `${LP(route, "specifier") || ''}`, routeRef: route.id, key: `${route.id}`})
    route.vessels.forEach(vessel => { vesselData.push({search: vesselSearchStrings(vessel), title: vessel.name, routeRef: route.id, key: `${route.id}:v:${vessel.name}`}); });
    route.piers.forEach(pier => { pierData.push({search: pierSearchStrings(pier), title: pier.name, specifier: LP(pier.mun, "name"), routeRef: route.id, pierRef: pier.id, key: `${route.id}:d:${pier.id}`}); });
  });
 
  searchData = [...routeData, ...pierData, ...vesselData];
}

function searchPhrase(phrase) {
  initData(rawData);
  const canonizedPhrase = canonizeName(phrase);
  return phrase.length === 0 ? [] : searchData.filter(item => item.search.filter(search => search.startsWith(canonizedPhrase)).length > 0);
}

export default function reducer(state = {
  phrase: '',
  results: []
}, action) {
  switch (action.type) {
    case "SEARCH_PHRASE_EDITED":
      const phrase = action.payload;
      return { ...state, phrase, results: searchPhrase(phrase) };
    // case "MENU_AND_SETTINGS_HIDDEN":
    //   return { ...state, phrase: '', results: [] };
    case "LOADING_DATA_FULFILLED":
      rawData = action.payload;
      return state;
    case "LOCALE_SET":
      searchData = [];
      return { ...state, phrase: '', results: [] };
    default:
      return state;
  }
}