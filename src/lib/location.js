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
let accuracyCircle = null;
let positionReceived = false;

function showPosition(map) {

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
  accuracyCircle = new window.google.maps.Circle({
    strokeColor: '#3B84DF',
    fillColor: '#3B84DF',
    strokeOpacity: 0.8,
    fillOpacity: 0.4,
    map: map,
    center: {lat: 0, lng: 0},
    radius: 0,
    clickable: false,
    visible: false
  });
  
  return (position) => {
    // console.log(position);
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    // if (!positionReceived && pos.lat >= 59.7 && pos.lat <= 60.5 && pos.lng >= 19.5 && pos.lng <= 23.0 && position.coords.accuracy <= 100) {
    //   map.panTo(pos);
    // }
    if (position.coords.accuracy <= 100 && (!positionReceived || locationButtonState === 2)) {
      map.panTo(pos);
    }
    positionReceived = true;
    if (!document[hidden] && positionWatcher) {
      locationSymbol.setPosition(pos);
      locationSymbolOuter.setPosition(pos);
      accuracyCircle.setCenter(pos);
      accuracyCircle.setRadius(position.coords.accuracy);
      if (position.coords.accuracy < 100) {
        locationSymbol.setVisible(true);
        locationSymbolOuter.setVisible(true);  
        accuracyCircle.setVisible(false);
      } else {
        locationSymbol.setVisible(false);
        locationSymbolOuter.setVisible(false);
        accuracyCircle.setVisible(true);
      }
    }
  };
}

function positioningError(error) {
  switchPosition(0);
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

let locationButtonState = 0; // 0 - off, 1 - locate, 2 - track
let positionWatcher = null;
let showPositionOnMap = null;

function refreshPositionWatcher() {
  // console.log('clearWatch');
  if (positionWatcher) navigator.geolocation.clearWatch(positionWatcher)
  if (locationButtonState !== 0 && !document[hidden]) {
    // console.log('watchPosition');
    positionWatcher = navigator.geolocation.watchPosition(
      showPositionOnMap,
      positioningError,
      {timeout: 10000, enableHighAccuracy: true})
    if (locationSymbol) {
      locationSymbol.setVisible(true);
      locationSymbolOuter.setVisible(true);
      accuracyCircle.setVisible(true);
    }
  } else {
    // console.log('do not watchPosition');
    positionWatcher = null;
    positionReceived = false;
    if (locationSymbol) {
      locationSymbol.setVisible(false);
      locationSymbolOuter.setVisible(false);
      accuracyCircle.setVisible(false);
    }
  }
}

function togglePosition() {
  switchPosition((locationButtonState + 1) % 3);
}

function switchPosition(newState) {
  locationButtonState = newState;

  document.getElementById("location-button").classList.remove("active");
  document.getElementById("location-button").classList.remove("follow");

  if (locationButtonState !== 0) {
    document.getElementById("location-button").classList.add("active");
  }
  
  if (locationButtonState === 2) {
    document.getElementById("location-button").classList.add("follow");
  }

  refreshPositionWatcher();
}

function onDragEnd() {
  if (locationButtonState === 2) {
    switchPosition(1);
  }
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
      window.google.maps.event.addListener(map, 'dragstart', onDragEnd)
    }
	}

  map = null;
}
