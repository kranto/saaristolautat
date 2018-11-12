import { toggleScrollIndicator, toggleHeaderbar, hideMenuAndSettings, hideSettings, hideMenu } from './uicontrol';
import { panTo } from './mapcontrol';
import { lauttaLegs, lauttaRoutes } from './routes';
import store from '../store';
import { getMapStyle } from './styles';

let google;
let map;

const { $, history, location } = window;

export function showLivePage() {
  var liveMapUri = "live.html?lng=" + map.getCenter().lng() + "&lat=" + map.getCenter().lat() + "&zoom=" + map.getZoom();
  window.open(liveMapUri, "livemap");
}

export function menuItemClicked(infoPage) {
  if (history.state && history.state.infoPage === infoPage) return;
  var newState = { infoPage: infoPage, depth: history.state && history.state.depth ? history.state.depth + 1 : 1 };
  history.pushState(newState, null, null);
  navigateTo(newState);
}

let layers = store.getState().settings.layers;
let locale = store.getState().settings.locale;
let fdata = store.getState().data.data;

function onStateChanged() {
  const newState = store.getState();
  if (newState.settings.layers !== layers) {
    layers = newState.settings.layers;
    onLayersChanged();
  }
  if (newState.settings.locale !== locale) {
    locale = newState.settings.locale;
    onLocaleChanged();
  }
  fdata = newState.data.data;
  if (map && map.getMapTypeId() !== newState.settings.mapTypeId) {
    map.setMapTypeId(newState.settings.mapTypeId);
  }
}
setTimeout(() => store.subscribe(onStateChanged), 100);

function onLayersChanged() {
  rerender(map, true);
}

function onLocaleChanged() {
  if (objects) {
    objects.filter(o => o.init).forEach(o => o.init());
    rerender(map, true);
  }

  if (typeof lauttaRoutes !== 'undefined') {
    lauttaRoutes.filter(r => r.init).forEach(r => r.init());
  }
}

function addMapListeners(map) {
  google.maps.event.addListener(map, 'maptypeid_changed', () => {
    var isSatellite = map.getMapTypeId() === 'satellite' || map.getMapTypeId() === 'hybrid';
    if (isSatellite) {
      $('#setMapTypeMap').removeClass('active');
      $('#setMapTypeSatellite').addClass('active');
    } else {
      $('#setMapTypeMap').addClass('active');
      $('#setMapTypeSatellite').removeClass('active');
    }
  });

  map.addListener('click', () => toggleHeaderbar(unselectAll));
}

var loaderTimeout = false;
var mapInitialized = false;

// if (window.location.hostname === "localhost") $("#loader").fadeOut(500);

setTimeout(() => { loaderTimeout = true; hideLoader(); }, 3000);

function onMapIdle() {
  if (map.getZoom() < 8) {
    map.setZoom(8);
    map.panToBounds({ south: 60, west: 21.4, east: 22.4, north: 60.5 });
  } else {
    var z = map.getZoom();
    map.setZoom(z - 1);
    setTimeout(() => map.setZoom(z), 100);
  }
  mapInitialized = true;
  hideLoader();
}

var dontShowAgainVersion = localStorage.getItem("dontShowAgainVersion") || 0;
var currentBannerVersion;

function hideLoader() {
  currentBannerVersion = $("#dont-show-again-cb").attr("version") || 0;
  if (loaderTimeout && mapInitialized) {
    rerender(map, true);
    $("#loader").fadeOut(1000);
    if (dontShowAgainVersion < currentBannerVersion && !location.hash && !selected.length) {
      $('#bannerModal').modal({});
      setTimeout(() => $('#bannerModal').modal({}), 500);
    }
  }
}

$(document).ready(() => {
  $("#bannerModal").on('hidden.bs.modal', () => {
    if ($("#dont-show-again-cb").is(":checked")) {
      localStorage.setItem("dontShowAgainVersion", currentBannerVersion);
    }
  });
});

$(document).ready(() => {
  if (window.location.hash) setTimeout(onhashchange, 2000);
  else history.replaceState({}, null);
});

window.onhashchange = () => {
  var hash = location.hash.substring(1);
  if (fdata.routes[hash]) {
    var newState = { route: hash, timetable: null };
    history.replaceState(newState, null, "/");
    navigateTo(newState);
  } else if (fdata.piers[hash]) {
    history.go(-1);
    objects.filter(o => o.id === hash)[0].showTooltip(true);
  }
}

export function closeInfoPage() {
  history.go(-history.state.depth);
}

function navigateTo(state) {
  console.log('navigateTo', state);
  if (!state || !state.timetable) {
    closeTimetables();
  }
  if (!state || !state.infoPage) {
    store.dispatch({type: "INFOPAGE_SELECTED", payload: null});    
  }
  if (state && state.route) {
    if (typeof state.route === 'string') {
      selectByIds([state.route]);
    } else if (Array.isArray(state.route)) {
      select(lauttaRoutes.filter(r => state.route.indexOf(r.id) >= 0), null, true);
    }
    if (state.timetable) {
      console.log('openTimetable');
      openTimetable(state.timetable);
    }
  } else if (state && state.infoPage) {
    store.dispatch({type: "INFOPAGE_SELECTED", payload: state.infoPage});
    hideMenu();
  } else {
    unselectAll(false);
  }
}

window.onpopstate = (event) => {
  if (location.hash) return;
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
  hideMenu();
  hideSettings();
}

function closeTimetables() {
  store.dispatch({ type: "TIMETABLE_CLOSED" });
}

var pierlinkDown = false;

function initPierLinks() {
  var isTouch = false;

  $("div.pierlink").mouseover(function (event) {
    if (!isTouch) {
      var dataTarget = this.getAttribute("data-target");
      objects.filter(o => o.id === dataTarget)[0].showTooltip(false);
    }
  });

  $("div.pierlink").mouseout(() => {
    if (!pierlinkDown) tooltip.close();
  });

  $("div.pierlink").mousedown(() => {
    if (!isTouch) {
      $(".info").animate({ opacity: 0 });
      pierlinkDown = true;
    }
  });

  $("div.pierlink").mouseup(() => {
    if (!isTouch) {
      $(".info").animate({ opacity: 1 });
      pierlinkDown = false;
    }
  });

  var touchstartTimeout = null;
  $("div.pierlink").bind("touchstart", function (event) {
    isTouch = true;
    var dataTarget = this.getAttribute("data-target");
    objects.filter(o => o.id === dataTarget)[0].showTooltip(false);
    touchstartTimeout = setTimeout(() => {
      $(".info").animate({ opacity: 0 });
      pierlinkDown = true;
    }, 200);
  });

  $("div.pierlink").bind("touchend", () => {
    if (touchstartTimeout) clearTimeout(touchstartTimeout);
    touchstartTimeout = null;
    setTimeout(() => {
      $(".info").animate({ opacity: 1 });
      pierlinkDown = false;
    }, 500);
  });
}

$(document).ready(() => {
  $("body").mouseup(() => {
    if (pierlinkDown) {
      $(".info").animate({ opacity: 1 });
      pierlinkDown = false;
    }
  });
});


function setInfoContent(targets, dontPushState) {
  var route;
  if (targets[0].ref) {
    route = targets[0].ref;
    if (!dontPushState) history.pushState({ route: route, timetable: null }, null, null);

    store.dispatch({ type: "INFOCONTENT_SELECTED", payload: route });
  } else {
    store.dispatch({ type: "INFOCONTENT2_SELECTED", payload: targets });
    if (!dontPushState) history.pushState({ route: targets.map(r => r.id), timetable: null }, null, null);
  }

  if ($(".infocontent.removing").length) $(".infocontent:not(.removing)").hide();

  if (targets[0].style) {
    var style = targets[0].style;
    $(".infocontent:not(.removing)").find(".infotitle, .headerbox").css({ borderBottom: style.weight + "px " + style.style + " " + style.color });
  } else {
    $(".infocontent:not(.removing)").find(".infotitle, .headerbox").css({ borderBottom: "none" });
  }

  initPierLinks();

  $(".infocontent.removing").fadeOut('fast', () => {
    $(".infocontent.removing").remove();
    $(".infocontent").fadeIn('fast');
  });
}

var selected = [];

function selectByIds(ids) {
  var matching = objects.filter(o => o.ref && ids.indexOf(o.ref) >= 0);
  if (matching.length) {
    select(matching, null, true);
  } else {
    unselectAll();
  }
}

export function select(targets, mouseEvent, dontPushState) {
  if (!targets.length) return;

  hideMenu();
  hideSettings();

  var selectedCountWas = selected.length;
  selected.forEach(target => { target.highlight(false); if (target.rerender) target.rerender(map.getZoom(), map.getMapTypeId(), layers); });
  selected = [];

  targets = (targets.constructor === Array) ? targets : [targets];
  targets.forEach(target => {
    target.highlight(true);
    selected.push(target);
  });

  setInfoContent(targets, dontPushState);
  toggleScrollIndicator();

  $(".info").scrollTop(0);

  if (selectedCountWas === 0) {
    if ($("body").outerWidth() >= 768) {
      var clientX = mouseEvent ? latLng2Point(mouseEvent.latLng, map).x : 500;
      if (clientX < (400 + 50)) map.panBy(clientX - (($("#map").width() - 400) / 3 + 400), 0);
    } else {
      var clientY = mouseEvent ? latLng2Point(mouseEvent.latLng, map).y : 0;
      if ($("#map").height() * 0.80 < clientY) map.panBy(0, $("#map").height() * 0.2);
    }
  }

  if (!mouseEvent && targets[0].bounds) {
    panTo(map, targets[0].bounds, $("#mapcontainer").outerWidth());
  }
}

function latLng2Point(latLng, map) {
  var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
  return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}

export function unselectAll(pushState) {
  if (selected.length === 0) return;

  if (typeof pushState === 'undefined') pushState = true;
  if (pushState) history.pushState({ route: null }, null, null);
  store.dispatch({ type: "INFOCONTENT_UNSELECTED", payload: null });

  selected.forEach(target => { target.highlight(false); if (target.rerender) target.rerender(map.getZoom(), map.getMapTypeId(), layers); });
  selected = [];
}

function updateMapStyles() {
  map.setOptions({ styles: getMapStyle(map.getMapTypeId(), map.getZoom(), {}) });
  $("div.gm-style").css({ 'font-size': map.getZoom() + 1 });
}

export const objects = [];
var prevRerender = "";
var hidden = true;
var prevRenderZoom = 0;

function rerender(map, force) {
  var zoom = map.getZoom();
  var mapTypeId = map.getMapTypeId();
  var newRerender = mapTypeId + ":" + zoom + ":" + objects.length;
  if (prevRerender === newRerender && !force) return;
  prevRerender = newRerender;
  objects.forEach(object => object.rerender(zoom, mapTypeId, layers));
  if (lauttaLegs) lauttaLegs.forEach(leg => leg.rerender(zoom, mapTypeId, layers));
  hidden = false;
  prevRenderZoom = zoom;
}

function hideObjects(map) {
  if (hidden) return;
  var zoom = map.getZoom();
  if (zoom === prevRenderZoom) return;
  objects.filter(o => o.hide).forEach(o => o.hide());
  hidden = true;
}

var mapOptions = {
  center: { lat: 60.25, lng: 21.25 },
  zoom: 9,
  minZoom: 4,
  maxZoom: 15,
  mapTypeControl: false,
  fullscreenControl: false,
  streetViewControl: false,
  gestureHandling: 'greedy',
  scaleControl: true,
  styles: [],
};

export let tooltip;
export function createMap() {
  google = window.google;
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  map.setMapTypeId(store.getState().settings.mapTypeId);
  map.fitBounds({ south: 60, north: 60.5, west: 20, east: 22.3 });
  updateMapStyles();

  google.maps.event.addListenerOnce(map, 'idle', onMapIdle);

  map.addListener('zoom_changed', updateMapStyles);

  tooltip = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true
  });

  map.addListener('zoom_changed', () => {
    hideObjects(map);
    setTimeout(() => { rerender(map); }, 50);
  });

  map.addListener('maptypeid_changed', () => {
    $(".map").toggleClass("satellite", map.getMapTypeId() === 'satellite' || map.getMapTypeId() === 'hybrid');
    updateMapStyles();
    rerender(map, true);
  });

  addMapListeners(map);

  // initKeepCenter(map, () => selected.length);
  return map;
}
