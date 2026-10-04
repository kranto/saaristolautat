import store from '../store';
import { map, panToObject, unselectAll } from './ferries';
import { showPierTooltip } from './objects';
import { hideMenuAndSettings } from './uicontrol';
import { lauttaRoutes } from './routes';
import { shortName, description } from './datautils';

const { history, location, $ } = window;
let hashRetry;

$(document).ready(() => {
  if (window.location.hash) setTimeout(onhashchange, 2000);
  else history.replaceState({}, null);
});

window.onhashchange = () => {
  const { data, geojson } = store.getState().data;
  if (!data.routes || !data.piers || geojson.length === 0) {
    clearTimeout(hashRetry);
    hashRetry = setTimeout(window.onhashchange, 250);
    return;
  }

  var hash = location.hash.substring(1);
  if (data.routes[hash]) {
    var newState = { route: hash, timetable: null };
    history.replaceState(newState, null, window.location.pathname);
    navigateTo(newState, true);
  } else if (data.piers[hash]) {
    //history.go(-1);
    showPierTooltip(hash, true);
  }
}

window.onpopstate = (event) => {
  if (!event.state) return;
  navigateTo(event.state, true);
};

$(document).keyup((e) => {
  if (e.keyCode === 27) { // escape key maps to keycode `27`
    if (hideMenuAndSettings()) {
      // nothing
    } else if (history.state.infoPage) {
      closeInfoPage();
    } else if (history.state.timetable) {
      history.back();
    } else if (history.state.route) {
      unselectAll();
    }
  }
});

export function menuItemClicked(infoPage) {
  if (history.state && history.state.infoPage === infoPage) return;
  var newState = { infoPage: infoPage, depth: history.state && history.state.depth ? history.state.depth + 1 : 1 };
  history.pushState(newState, null, null);
  navigateTo(newState);
}

export function onTimetableButtonClicked(href, route, timetable) {
  if (href) {
    window.open(href, "info");
  } else {
    const newState = { route: route, timetable: timetable };
    history.pushState(newState, null, null);
    navigateTo(newState);
  }
}

function openTimetable(id) {
  store.dispatch({ type: "TIMETABLE_OPENED", payload: id });
  hideMenuAndSettings();
}

function closeTimetables() {
  store.dispatch({ type: "TIMETABLE_CLOSED" });
}

export function closeInfoPage() {
  history.go(-history.state.depth);
}

export function selectRoute(route, panTo=true) {
  history.pushState({ route: route, timetable: null }, null, null);
  navigateTo(history.state, panTo);
}

function navigateTo(state, panTo) {
  // console.log('navigateTo', state, history, new Error().stack);
  if (!state || !state.timetable) {
    closeTimetables();
  }
  if (!state || !state.infoPage) {
    store.dispatch({ type: "INFOPAGE_SELECTED", payload: null });
  }
  if (state && state.route) {
    if (typeof state.route === 'string') {
      store.dispatch({ type: "INFOCONTENT_SELECTED", payload: state.route });
      if (panTo) panToObject(state.route);
    } else if (Array.isArray(state.route)) {
      const data = store.getState().data.data;
      const routes = lauttaRoutes.length ? lauttaRoutes.filter(r => state.route.indexOf(r.id) >= 0) :
        (data.lauttaRoutes || []).filter(route => state.route.indexOf(route.id) >= 0).map(route => ({
          id: route.id,
          name: shortName(route),
          details: description(route),
          operator: data.lauttaOperators?.[route.operators?.[0]],
          style: { color: '#e08080', weight: 1.5, style: 'dotted', opacity: 0.7 }
        })).filter(route => route.operator);
      store.dispatch({ type: "INFOCONTENT2_SELECTED", payload: routes });
    }
    if (state.timetable) {
      openTimetable(state.timetable);
    }
  } else if (state && state.infoPage) {
    store.dispatch({ type: "INFOPAGE_SELECTED", payload: state.infoPage });
    hideMenuAndSettings();
  } else {
    unselectAll(false);
  }
}

export function showLivePage() {
  var liveMapUri = "live.html?lng=" + map.getCenter().lng() + "&lat=" + map.getCenter().lat() + "&zoom=" + map.getZoom();
  window.open(liveMapUri, "livemap");
}
