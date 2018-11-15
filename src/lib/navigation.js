import store from '../store';
import { map, panToObject, unselectAll } from './ferries';
import { showPierTooltip } from './objects';
import { hideMenuAndSettings } from './uicontrol';
import { lauttaRoutes } from './routes';

const { history, location, $ } = window;

$(document).ready(() => {
  if (window.location.hash) setTimeout(onhashchange, 2000);
  else history.replaceState({}, null);
});

window.onhashchange = () => {
  var hash = location.hash.substring(1);
  if (store.getState().data.data.routes[hash]) {
    var newState = { route: hash, timetable: null };
    history.replaceState(newState, null, "/");
    navigateTo(newState);
  } else if (store.getState().data.data.piers[hash]) {
    //history.go(-1);
    showPierTooltip(hash, true);
  }
}

window.onpopstate = (event) => {
  navigateTo(event.state);
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

export function selectRoute(route) {
  history.pushState({ route: route, timetable: null }, null, null);
  navigateTo(history.state, true);
}

function navigateTo(state, isNewState) {
  // console.log('navigateTo', state, history);
  if (!state || !state.timetable) {
    closeTimetables();
  }
  if (!state || !state.infoPage) {
    store.dispatch({ type: "INFOPAGE_SELECTED", payload: null });
  }
  if (state && state.route) {
    if (typeof state.route === 'string') {
      store.dispatch({ type: "INFOCONTENT_SELECTED", payload: state.route });
      if (!isNewState) panToObject(state.route);
    } else if (Array.isArray(state.route)) {
      const routes = lauttaRoutes.filter(r => state.route.indexOf(r.id) >= 0);
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
