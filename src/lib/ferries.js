import { toggleScrollIndicator, cancelHeaderBarToggle, toggleHeaderbar, hideMenuAndSettings, hideSettings, hideInfoPage, hideMenu } from './uicontrol';
import { panTo } from './mapcontrol';
import { lauttaLegs, lauttaRoutes } from './routes';
import store from '../store';
import { getMapStyle } from './styles';

let google;
let map;

const { $, history, location } = window;

$(document).ready(function () {
  $(".info").on("mouseleave", function (e) {
    $("#wrapper2").css({ pointerEvents: "none" });
    $(".mapoverlay").css({ pointerEvents: "none" });
  });

  $(".info").on("mouseenter mousedown touchstart", function (e) {
    $("#wrapper2").css({ pointerEvents: "auto" });
    $(".mapoverlay").css({ pointerEvents: "auto" });
    $("#wrapper2").trigger(e.type, e);
  });

  function getAllEvents(element) {
    var result = [];
    for (var key in element) {
      if (key.indexOf('on') === 0) {
        result.push(key.slice(2));
      }
    }
    return result.join(' ');
  }

  var el = $(".mapoverlay");
  el.bind(getAllEvents(el[0]), function (e) {
    $("#wrapper2").css({ pointerEvents: "none" });
    $(".mapoverlay").css({ pointerEvents: "none" });
    $("#mapcontainer").trigger(e.type, e);
  });

  $("body").mouseup(function (event) {
    if (pierlinkDown) {
      $(".info").animate({ opacity: 1 });
      pierlinkDown = false;
    }
  });

});

$(window).resize(function () {
  keepCenter();
});

var mapCenter;
var leftInfo = false;
var bottomInfo = false;

function rememberCenter() {
  mapCenter = map.getCenter();
  leftInfo = $("body").outerWidth() >= 768 && selected.length > 0;
  bottomInfo = $("body").outerWidth() < 768 && selected.length > 0;
}

function keepCenter() {
  var oldCenter = mapCenter;
  if (map && mapCenter) setTimeout(function () {
    map.setCenter(oldCenter);
    if (leftInfo && $("#map").outerWidth() < 768) map.panBy(200, 0);
    if (bottomInfo && $("#map").outerWidth() >= 768) map.panBy(-200, 0);
  }, 50);
}

$(document).ready(function () {
  if (window.location.hash) setTimeout(function () { onhashchange(); }, 2000);
  else history.replaceState({}, null);
});

window.onhashchange = function () {
  var hash = location.hash.substring(1);
  if (fdata.routes[hash]) {
    var newState = { route: hash, timetable: null };
    // console.log('onhashchange: replacing state to', newState);
    history.replaceState(newState, null, "/");
    navigateTo(newState);
  } else if (fdata.piers[hash]) {
    history.go(-1);
    objects.filter(function (o) { return o.id === hash; })[0].showTooltip(true);
  }
}

function openInfoPage(target) {
  $('#infopage').fadeIn();
  $("#infopage").scrollTop(0);
  $(".infosection").hide();
  if (target !== "none") {
    $(target).show();
    unselectAll(false);
  }
  hideMenu();
}

export function closeInfoPage() {
  history.go(-history.state.depth);
}

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

export function initSettings() {
  $(".mapTypeSelect").bind('change', function () {
    const newValue = this.options[this.selectedIndex].value;
    map.setMapTypeId(newValue);
  });
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
}
setTimeout(() => store.subscribe(onStateChanged), 100);

function onLayersChanged() {
  rerender(map, true);
}

function onLocaleChanged() {
  if (objects) {
    objects.forEach(function (object) { if (object.init) object.init(); });
    rerender(map, true);
  }

  if (typeof lauttaRoutes !== 'undefined') {
    lauttaRoutes.forEach(function (route) { if (route.init) route.init(); });
  }
}

function addMapListeners(map) {
  google.maps.event.addListener(map, 'maptypeid_changed', function () {
    var isSatellite = map.getMapTypeId() === 'satellite' || map.getMapTypeId() === 'hybrid';
    if (isSatellite) {
      $('#setMapTypeMap').removeClass('active');
      $('#setMapTypeSatellite').addClass('active');
    } else {
      $('#setMapTypeMap').addClass('active');
      $('#setMapTypeSatellite').removeClass('active');
    }
  });

  map.addListener('click', function () {
    toggleHeaderbar(unselectAll);
  });
  map.addListener('idle', rememberCenter);
}

var loaderTimeout = false;
var mapInitialized = false;

// if (window.location.hostname === "localhost") $("#loader").fadeOut(500);

setTimeout(function () { loaderTimeout = true; hideLoader(); }, 3000);

function onMapIdle() {
  if (map.getZoom() < 8) {
    map.setZoom(8);
    map.panToBounds({ south: 60, west: 21.4, east: 22.4, north: 60.5 });
  } else {
    var z = map.getZoom();
    map.setZoom(z - 1);
    setTimeout(function () { map.setZoom(z); }, 100);
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
      setTimeout(function () { $('#bannerModal').modal({}); }, 500);
    }
  }
}

$(document).ready(function () {
  $("#bannerModal").on('hidden.bs.modal', function () {
    if ($("#dont-show-again-cb").is(":checked")) {
      localStorage.setItem("dontShowAgainVersion", currentBannerVersion);
    }
  });
});

$(document).keyup(function (e) {
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

function closeTimetables() {
  $('#timetables').fadeOut(function () {
    store.dispatch({ type: "TIMETABLE_CLOSED" });
  });
  $('#timetables').scrollTop(0);
}

function openTimetable(id) {
  store.dispatch({ type: "TIMETABLE_OPENED", payload: id });
  $('#timetables').fadeIn();
  hideMenu();
  hideSettings();
}

var pierlinkDown = false;

function initPierLinks() {
  var isTouch = false;

  $("div.pierlink").mouseover(function (event) {
    if (!isTouch) {
      var dataTarget = this.getAttribute("data-target");
      objects.filter(function (o) { return o.id === dataTarget; })[0].showTooltip(false);
    }
  });

  $("div.pierlink").mouseout(function (event) {
    if (!pierlinkDown) tooltip.close();
  });

  $("div.pierlink").mousedown(function (event) {
    if (!isTouch) {
      $(".info").animate({ opacity: 0 });
      pierlinkDown = true;
    }
  });

  $("div.pierlink").mouseup(function (event) {
    if (!isTouch) {
      $(".info").animate({ opacity: 1 });
      pierlinkDown = false;
    }
  });

  var touchstartTimeout = null;
  $("div.pierlink").bind("touchstart", function (event) {
    isTouch = true;
    var dataTarget = this.getAttribute("data-target");
    objects.filter(function (o) { return o.id === dataTarget; })[0].showTooltip(false);
    touchstartTimeout = setTimeout(function () {
      $(".info").animate({ opacity: 0 });
      pierlinkDown = true;
    }, 200);
  });

  $("div.pierlink").bind("touchend", function (event) {
    if (touchstartTimeout) clearTimeout(touchstartTimeout);
    touchstartTimeout = null;
    setTimeout(function () {
      $(".info").animate({ opacity: 1 });
      pierlinkDown = false;
    }, 700);
  });
}


function setInfoContent(targets, dontPushState) {

  var route;
  if (targets[0].ref) {
    route = targets[0].ref;
    if (!dontPushState) history.pushState({ route: route, timetables: null }, null, null);

    store.dispatch({ type: "INFOCONTENT_SELECTED", payload: route });
  } else {
    store.dispatch({ type: "INFOCONTENT2_SELECTED", payload: targets });
    if (!dontPushState) history.pushState({ route: targets.map(function (r) { return r.id; }), timetables: null }, null, null);
  }

  if ($(".infocontent.removing").length) $(".infocontent:not(.removing)").hide();

  if (targets[0].style) {
    var style = targets[0].style;
    $(".infocontent:not(.removing)").find(".infotitle, .headerbox").css({ borderBottom: style.weight + "px " + style.style + " " + style.color });
  } else {
    $(".infocontent:not(.removing)").find(".infotitle, .headerbox").css({ borderBottom: "none" });
  }

  initPierLinks();

  $(".infocontent.removing").fadeOut('fast', function () {
    $(".infocontent.removing").remove();
    $(".infocontent").fadeIn('fast');
  });

  $(".timetablebutton").click(function () {
    if (this.getAttribute("linktype") === "external") {
      window.open(this.getAttribute("href"), "info");
    } else {
      var timetable = this.getAttribute("data-target");
      history.pushState({ route: route, timetable: timetable }, null, null);
      openTimetable(timetable);
    }
  });
}

function navigateTo(state) {
  // console.log('navigateTo', state);
  if (!state || !state.timetable) {
    closeTimetables();
  }
  if (!state || !state.infoPage) {
    hideInfoPage();
  }
  if (state && state.route) {
    if (typeof state.route === 'string') {
      selectByIds([state.route]);
    } else if (Array.isArray(state.route)) {
      select(lauttaRoutes.filter(function (lr) { return state.route.indexOf(lr.id) >= 0; }), null, true);
    }
    if (state.timetable) {
      openTimetable(state.timetable);
    }
  } else if (state && state.infoPage) {
    openInfoPage(state.infoPage);
  } else {
    unselectAll(false);
  }
}

window.onpopstate = function (event) {
  if (location.hash) return;
  $("#wrapper2").animate({ scrollTop: 0 }, 'fast', function () {
    navigateTo(event.state);
  });
};

var selected = [];

function selectByIds(ids) {
  var matching = objects.filter(function (o) { return o.ref && ids.indexOf(o.ref) >= 0; });
  if (matching.length) {
    select(matching, null, true);
  } else {
    unselectAll();
  }
}

export function select(targets, mouseEvent, dontPushState) {

  if (!targets.length) return;

  var selectedCountWas = selected.length;
  selected.forEach(function (target) { target.highlight(false); if (target.rerender) target.rerender(map.getZoom(), map.getMapTypeId(), layers); });
  selected = [];

  targets = (targets.constructor === Array) ? targets : [targets];
  targets.forEach(function (target) {
    target.highlight(true);
    selected.push(target);
  });

  setInfoContent(targets, dontPushState);
  toggleScrollIndicator();

  $(".info").scrollTop(0);

  if (selectedCountWas === 0) {

    $(function () {
      $("#wrapper2").toggleClass("info-open", true);
      if ($("body").outerWidth() >= 768) {
        $(".info").css({ left: -400 });
        $(".info").animate({ left: 0 }, 'fast', function () { $(".info").css({ left: "" }); });
        var clientX = mouseEvent ? latLng2Point(mouseEvent.latLng, map).x : 500;
        if (clientX < (400 + 50)) map.panBy(clientX - (($("#map").width() - 400) / 3 + 400), 0);
      } else {
        $(".info").css({ top: '100%' });
        $(".info").animate({ top: '80%' }, 'fast', function () { $(".info").css({ top: "" }); toggleScrollIndicator() });
        var clientY = mouseEvent ? latLng2Point(mouseEvent.latLng, map).y : 0;
        if ($("#map").height() * 0.80 < clientY) map.panBy(0, $("#map").height() * 0.2);
      }
    });
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
  $("#wrapper2").css({ pointerEvents: "none" });
  $(".mapverlay").css({ pointerEvents: "none" });

  if (selected.length === 0) return;
  if (typeof pushState === 'undefined') pushState = true;

  if (pushState) history.pushState({ route: null }, null, null);

  $(function () {
    if ($("body").outerWidth() >= 768) {
      $(".info").animate({ left: -400 }, 'fast', function () {
        $(".info").css({ left: "" });
        $("#wrapper2").toggleClass("info-open", false);
        store.dispatch({ type: "INFOCONTENT_UNSELECTED", payload: null });
      });
    } else {
      $("#wrapper2").animate({ scrollTop: 0 }, 'fast', function () {
        $(".info").animate({ top: '100%' }, 200, function () {
          $(".info").css({ top: "" });
        });
        $("#wrapper2").toggleClass("info-open", false);
        store.dispatch({ type: "INFOCONTENT_UNSELECTED", payload: null });
        toggleScrollIndicator();
      });
    }
  });
  selected.forEach(function (target) { target.highlight(false); if (target.rerender) target.rerender(map.getZoom(), map.getMapTypeId(), layers); });
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
  objects.forEach(function (object) { object.rerender(zoom, mapTypeId, layers); });
  if (lauttaLegs) lauttaLegs.forEach(function (leg) { leg.rerender(zoom, mapTypeId, layers); });
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
  map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
  map.fitBounds({ south: 60, north: 60.5, west: 20, east: 22.3 });
  updateMapStyles();

  google.maps.event.addListenerOnce(map, 'idle', onMapIdle);

  map.addListener('zoom_changed', updateMapStyles);

  tooltip = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true
  });

  map.addListener('zoom_changed', function () {
    cancelHeaderBarToggle();
    hideObjects(map);
    setTimeout(function () { rerender(map); }, 50);
  });

  map.addListener('maptypeid_changed', function () {
    $(".map").toggleClass("satellite", map.getMapTypeId() === 'satellite' || map.getMapTypeId() === 'hybrid');
    updateMapStyles();
    rerender(map, true);
  });

  addMapListeners(map);

  return map;
}
