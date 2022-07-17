import { getAllNames } from "../lib/datarenderer";
import { shortName } from "../lib/datautils";
import { LP } from "../lib/localizer";

let rawData = null;
let searchData = [];
const SKIP_WORDS = ["Route"]

function canonizeName(name) {
  return name.trim().toLowerCase().replaceAll("å", "a").replaceAll("ä", "a").replaceAll("ö", "o");
}

function routeSearchStrings(route) {
  const name = LP(route,"name");
  const parts = name.split(/[^A-Za-zåäöÅÄÖ]/)
    .filter(part => part.length > 2)
    .filter(part => part.match(/^[A-ZÅÖÄ]/))
    .filter(part => !SKIP_WORDS.includes(part));
  return [name, ...parts].map(canonizeName);
}

function vesselSearchStrings(vessel) {
  const vStr = canonizeName(vessel.name);
  const withoutPrefix = vStr.match(/^.\/. /) ? [vStr.substring(4)] : [];
  return [vStr, ...withoutPrefix];
}

function pierSearchStrings(pier) {
  const allNames = getAllNames(pier);
  return [allNames.primary, ...allNames.other].map(canonizeName);
}

function getPierName(pier) {
  const allNames = getAllNames(pier);
  const other = allNames.other.length > 0 ? ` (${allNames.other.join(',')})`: ''; 
  return `${allNames.primary}${other}`
}

function compareTitle(a, b) {
  return a.title.localeCompare(b.title);
}

function initData(data) {
  if (searchData.length > 0) return searchData;

  const routes = data.data.routes;

  const routeData = [];
  const pierData = [];
  const vesselData = [];

  Object.values(routes).filter(route => !route.obsolete).forEach(route => {
    routeData.push({search: routeSearchStrings(route), type: "route", title: LP(route,"name"), specifier: `${LP(route, "specifier") || ''}`, route: route, key: `${route.id}`})
    route.vessels.forEach(vessel => { vesselData.push({search: vesselSearchStrings(vessel), type: "vessel", title: vessel.name, route: route, vessel: vessel, key: `${route.id}:v:${vessel.name}`}); });
    route.piers.forEach(pier => { pierData.push({search: pierSearchStrings(pier), type: "pier", title: getPierName(pier), specifier: LP(pier.mun, "name"), route: route, pier: pier, key: `${route.id}:d:${pier.id}`}); });
  });
 
  routeData.sort(compareTitle);
  pierData.sort(compareTitle);
  vesselData.sort(compareTitle);
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