import { toggleHeaderbar, hideMenuAndSettings } from './uicontrol';
import { panTo } from './mapcontrol';
import { lauttaLegs, lauttaRoutes } from './routes';
import store from '../store';
import { getMapStyle } from './styles';
import { objects, objectIndex } from './objects';

let google;
export let map;

const { $, history, location } = window;

let layers = store.getState().settings.layers;
let locale = store.getState().settings.locale;

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

function setInfoContent(targets, dontPushState) {
  var route;
  if (targets[0].ref) {
    route = targets[0].ref;
    store.dispatch({ type: "INFOCONTENT_SELECTED", payload: route });
    if (!dontPushState) history.pushState({ route: route, timetable: null }, null, null);
  } else {
    store.dispatch({ type: "INFOCONTENT2_SELECTED", payload: targets });
    if (!dontPushState) history.pushState({ route: targets.map(r => r.id), timetable: null }, null, null);
  }
}

var selected = [];

export function selectById(id) {
  if (id) {
    var matching = objectIndex[id];
    select([matching], null, true);
  } else {
    unselectAll();
  }
}

export function select(targets, mouseEvent, dontPushState) {
  targets = (targets.constructor === Array) ? targets : [targets];
  if (!targets.length) return;

  hideMenuAndSettings();

  selected.forEach(target => { target.highlight(false); if (target.rerender) target.rerender(map.getZoom(), map.getMapTypeId(), layers); });
  selected = targets.slice();

  targets.forEach(target => target.highlight(true));

  setInfoContent(targets, dontPushState);
  panMapIfClickPointHidden(map, mouseEvent);

  if (!mouseEvent && targets[0].bounds) {
    panTo(map, targets[0].bounds, $("#mapcontainer").outerWidth());
  }
}

function panMapIfClickPointHidden(map, mouseEvent) {
  if ($("body").outerWidth() >= 768) {
    var clientX = mouseEvent ? latLng2Point(mouseEvent.latLng, map).x : 500;
    if (clientX < (400 + 50)) map.panBy(clientX - (($("#map").width() - 400) / 3 + 400), 0);
  } else {
    var clientY = mouseEvent ? latLng2Point(mouseEvent.latLng, map).y : 0;
    if ($("#map").height() * 0.80 < clientY) map.panBy(0, $("#map").height() * 0.2);
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
  lauttaLegs.forEach(leg => leg.rerender(zoom, mapTypeId, layers));
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

export function createMap() {
  google = window.google;
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  map.setMapTypeId(store.getState().settings.mapTypeId);
  map.fitBounds({ south: 60, north: 60.5, west: 20, east: 22.3 });
  updateMapStyles();

  google.maps.event.addListenerOnce(map, 'idle', onMapIdle);

  map.addListener('zoom_changed', updateMapStyles);

  map.addListener('zoom_changed', () => {
    hideObjects(map);
  });

  map.addListener('idle', () => rerender(map, false));

  map.addListener('maptypeid_changed', () => {
    $(".map").toggleClass("satellite", map.getMapTypeId() === 'satellite' || map.getMapTypeId() === 'hybrid');
    updateMapStyles();
    rerender(map, true);
  });

  addMapListeners(map);

  // initKeepCenter(map, () => selected.length);
  return map;
}
