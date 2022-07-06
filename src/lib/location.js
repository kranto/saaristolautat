function createLocationSymbol(scale, color, opacity) {
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    strokeWeight: 0,
    fillColor: color,
    fillOpacity: opacity,
    size: 100,
    scale: scale
  };
}

let locationSymbol = null;
let locationSymbolOuter = null;
let positionReceived = false;

function showPosition(map) {
  return (position) => {
    // console.log(position);
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    if (!positionReceived && pos.lat >= 59.7 && pos.lat <= 60.5 && pos.lng >= 19.5 && pos.lng <= 23.0 && position.coords.accuracy <= 100) {
      map.panTo(pos);
    }
    positionReceived = true;
    if (!locationSymbol) {
      locationSymbol = new window.google.maps.Marker({
        clickable: false,
        icon: createLocationSymbol(6, '#3B84DF', 0.9),
        zIndex: 1000,
        map: map,
        visible: false,
      });
      locationSymbolOuter = new window.google.maps.Marker({
        clickable: false,
        icon: createLocationSymbol(10, '#ffffff', 0.7),
        zIndex: 999,
        map: map,
        visible: false,
        });
    }
    if (!document[hidden] && positionWatcher && locationSymbol) {
      locationSymbol.setPosition(pos);
      locationSymbol.setVisible(true);
      locationSymbolOuter.setPosition(pos);
      locationSymbolOuter.setVisible(true);
    }
  };
}

function positioningError(error) {
  switchPosition(false);
  console.log(error);
  alert(error.message);
}

// Set the name of the hidden property and the change event for visibility
let hidden;
let visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

// If the page is hidden, pause the video;
// if the page is shown, play the video
function handleVisibilityChange() {
  refreshPositionWatcher()  
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" || hidden === undefined) {
  // console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
} else {
  // Handle page visibility change
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

let locationButtonStateActive = false;
let positionWatcher = null;
let showPositionOnMap = null;

function refreshPositionWatcher() {
  // console.log('clearWatch');
  if (positionWatcher) navigator.geolocation.clearWatch(positionWatcher)
  if (locationButtonStateActive && !document[hidden]) {
    // console.log('watchPosition');
    positionWatcher = navigator.geolocation.watchPosition(
      showPositionOnMap,
      positioningError,
      {timeout: 10000, enableHighAccuracy: true})
    if (locationSymbol) {
      locationSymbol.setVisible(true);
      locationSymbolOuter.setVisible(true);
    }
  } else {
    // console.log('do not watchPosition');
    positionWatcher = null;
    positionReceived = false;
    if (locationSymbol) {
      locationSymbol.setVisible(false);
      locationSymbolOuter.setVisible(false);
    }
  }
}

function togglePosition() {
  switchPosition(!locationButtonStateActive);
}

function switchPosition(switchOn) {
    locationButtonStateActive = switchOn;

  if (locationButtonStateActive) {
    document.getElementById("location-button").classList.add("active");
  } else {
    document.getElementById("location-button").classList.remove("active");
  }
  refreshPositionWatcher();
}

export default class LocationLayer {

  init(map) {
    this.map = map;
    if (navigator.geolocation) {
      showPositionOnMap = showPosition(map);
      this.positionButton = document.createElement("button");
      this.positionButton.id = "location-button"
      this.positionButton.classList.add("location-button");
      this.positionButton.addEventListener("click", togglePosition)
      map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(this.positionButton);
    }
	}

  map = null;
}
