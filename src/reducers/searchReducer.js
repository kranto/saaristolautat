import { getAllNames } from "../lib/datarenderer";
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
  const allMunNames = getAllNames(pier.mun);
  return [allNames.primary, ...allNames.other, allMunNames.primary, ...allMunNames.other].map(canonizeName);
}

function getPierName(pier) {
  const allNames = getAllNames(pier);
  const other = allNames.other.length > 0 ? ` (${allNames.other.join(',')})`: ''; 
  return `${allNames.primary}${other}`
}

function compareHits(a, b) {
  return a.title.localeCompare(b.title) || a.specifier.localeCompare(b.specifier) || a.routetitle.localeCompare(b.routetitle) || a.routespecifier.localeCompare(b.routespecifier);
}

function groupHits(rawHits) {

  const groups = [];
  let lastGroup = [];

  rawHits.forEach(hit => {
    if (lastGroup.length === 0 || hit.type !== lastGroup[0].type || hit.title !== lastGroup[0].title || hit.specifier !== lastGroup[0].specifier) {
      lastGroup = [hit];
      groups.push(lastGroup);
    } else {
      lastGroup.push(hit);
    }
  });

  return groups;
}

function initData(data) {
  if (searchData.length > 0) return searchData;

  const routes = data.data.routes;

  const routeData = [];
  const pierData = [];
  const vesselData = [];

  Object.values(routes).filter(route => !route.obsolete).forEach(route => {
    routeData.push({search: routeSearchStrings(route), type: "route", title: '', specifier: '', routetitle: LP(route,"name"), routespecifier: `${LP(route, "specifier") || ''}`, route: route, key: `${route.id}`})
    route.vessels.forEach(vessel => { vesselData.push({search: vesselSearchStrings(vessel), type: "vessel", title: vessel.name, specifier: route.operator[0] ? route.operator[0].name : '', routetitle: LP(route,"name"), routespecifier: `${LP(route, "specifier") || ''}`, route: route, vessel: vessel, key: `${route.id}:v:${vessel.name}`}); });
    route.piers.forEach(pier => { pierData.push({search: pierSearchStrings(pier), type: "pier", title: getPierName(pier), specifier: LP(pier.mun, "name"), routetitle: LP(route,"name"), routespecifier: `${LP(route, "specifier") || ''}`, route: route, pier: pier, key: `${route.id}:d:${pier.id}`}); });
  });
 
  routeData.sort(compareHits);
  pierData.sort(compareHits);
  vesselData.sort(compareHits);
  searchData = [...routeData, ...pierData, ...vesselData];
}

function searchPhrase(phrase) {
  initData(rawData);
  const canonizedPhrase = canonizeName(phrase);
  return phrase.length === 0 ? [] : groupHits(searchData.filter(item => item.search.filter(search => search.startsWith(canonizedPhrase)).length > 0));
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