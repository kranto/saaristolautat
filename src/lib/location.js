import store from '../store';

const google = window.google;

const LIVE_MIN_ZOOM = 8;

function getVesselAge(feature) {
  const timestamp = feature.getProperty("timestampExternal")
  if (timestamp)
    return Math.max(0, Date.now() - timestamp) / 1000;
  else
    return 86400;
}

function vesselIsCurrent(feature) {
  return getVesselAge(feature) < 600;
}

function vesselIsVisible(map, feature) {
  if (feature.getGeometry().getType() === 'Point') {
    return map.getZoom() >= LIVE_MIN_ZOOM && vesselIsCurrent(feature);
  } else {
    return map.getZoom() >= LIVE_MIN_ZOOM;
  }
}

function createVesselIcon(map, feature) {
  const speed = feature.getProperty("sog");
  const relOpacity = Math.max(0.3, 1 - 0.7 * Math.max(0, getVesselAge(feature) - 180) / 600);
  const color = map.getMapTypeId() === 'satellite' ? '#80b0a0' : '#a030ff';
  const hasSpeed = speed > 0.1;
  const scale = hasSpeed ? 3 : 2;
  const rotation = hasSpeed ? feature.getProperty("cog") : 45;
  const path = hasSpeed ? "M -1 2 L -1 -2 0 -3 1 -2 1 2 0 1 -1 2" : "M -1 -1 L 1 -1 1 1 -1 1 -1 -1";
  return {
    path: path,
    rotation: rotation,
    strokeWeight: 1,
    strokeColor: color,
    strokeOpacity: 1 * relOpacity,
    fillColor: color,
    fillOpacity: 0.6 * relOpacity,
    scale: scale * (map.getZoom() < 9 ? 0.6 : map.getZoom() / 10)
  };
}

function createLocationSymbol(color, opacity) {
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    strokeWeight: 0,
    fillColor: color,
    fillOpacity: opacity,
    size: 100,
    scale: 6
  };
}

let locationSymbol = null;
let positionReceived = false;

function showPosition(map) {
  return (position) => {
    console.log(position);
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
      icon: createLocationSymbol('#3B84DF', 0.9),
      zIndex: 1000,
      map: map,
      visible: false,
      });
    }
    locationSymbol.setPosition(pos);
    locationSymbol.setVisible(true);
  };
}

function positioningError(error) {
  alert(error.message);
  console.log(error);
}


export default class LocationLayer {

  positionWatcher = null;

  togglePosition() {
    if (!this.positionWatcher) {
      this.positionWatcher = navigator.geolocation.watchPosition(
        showPosition(this.map),
        positioningError,
        {timeout: 10000, enableHighAccuracy: true})
      document.getElementById("location-button").classList.add("active");
    } else {
      navigator.geolocation.clearWatch(this.positionWatcher)
      this.positionWatcher = null;
      document.getElementById("location-button").classList.remove("active");
      locationSymbol.setVisible(false);
      positionReceived = false;
    }
  }

    init(map) {
    this.map = map;
    // this.initStyle();
    // this.refreshLiveLayer();
    // map.addListener('idle', this.updateLiveInd.bind(this));
    // store.subscribe(this.stateListener.bind(this));
    this.init2(map)
  }

  init2(map) {
    if (navigator.geolocation) {
      this.positionButton = document.createElement("button");
      this.positionButton.id = "location-button"
      this.positionButton.classList.add("location-button");
      this.positionButton.addEventListener("click", () => this.togglePosition())
      map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(this.positionButton);
    }
	}

  layers = store.getState().settings.layers;
  
  stateListener() {
    this.layers = store.getState().settings.layers;
    this.refreshLiveLayer();
  }

  map = null;
  liveInterval = null;
  liveLoadCount = 0;

  liveLayerEnabled = null;

  refreshLiveLayer() {
    if (this.layers.live === this.liveLayerEnabled) return; // state not changed
    this.liveLayerEnabled = this.layers.live;

    if (this.liveInterval) {
      clearInterval(this.liveInterval);
      this.liveInterval = null;
    }

    if (this.liveLayerEnabled) {
      store.dispatch({ type: "UPDATE_INDICATOR_MSG", payload: "live.loading" });
      this.loadLiveData();
      this.liveInterval = setInterval(this.loadLiveData.bind(this), 10000);
    } else {
      store.dispatch({ type: "UPDATE_INDICATOR_MSG", payload: "" });
      this.map.data.forEach(feature => this.map.data.remove(feature));
      this.liveLoadCount = 0;
    }

  }

  loadLiveData() {
    this.map.data.loadGeoJson('https://live.saaristolautat.fi/livedata.json',
      { idPropertyName: "mmsi" },
      () => {
        this.liveLoadCount++;
        this.updateLiveInd();
      });
    this.map.data.loadGeoJson('https://live.saaristolautat.fi/livehistory.json');
  }

  initStyle() {
    this.map.data.setStyle(feature => {
      const isVessel = feature.getGeometry().getType() === 'Point';
      const isVisible = vesselIsVisible(this.map, feature);
      return {
        visible: isVisible,
        strokeColor: '#a0a0a0',
        strokeWeight: 0.5,
        icon: isVisible && isVessel ? createVesselIcon(this.map, feature) : null,
        zIndex: isVessel ? 100 : 99,
        clickable: false
      };
    });
  }

  updateLiveInd() {
    if (!this.liveLoadCount) return;
    if (!this.layers.live) {
      store.dispatch({ type: "UPDATE_INDICATOR_MSG", payload: "" });
      return;
    }
    let sumCurrentInBounds = 0;
    let countCurrentInBounds = 0;
    let countCurrentInBoundsEncourse = 0;
    let countCurrentTotal = 0;
    let minCurrentInBounds = 1000;
    let maxCurrentInBounds = -1;
    this.map.data.forEach((feature) => {
      const isVessel = feature.getGeometry().getType() === 'Point';
      if (isVessel) {
        const isCurrent = vesselIsCurrent(feature);
        if (isCurrent) countCurrentTotal++;
        if (this.map.getBounds().contains(feature.getGeometry().get())) {
          if (isCurrent) {
            const age = getVesselAge(feature);
            sumCurrentInBounds += age;
            countCurrentInBounds++;
            if (feature.getProperty("sog") > 0.1) {
              maxCurrentInBounds = Math.max(maxCurrentInBounds, age);
              minCurrentInBounds = Math.min(minCurrentInBounds, age);
              countCurrentInBoundsEncourse++;
            }
          }
        }
      }
    });

    let msg = ["live.notavailable"];
    if (countCurrentTotal > 0) {
      if (this.map.getZoom() < LIVE_MIN_ZOOM) {
        msg = ["live.zoomin"];
      } else if (countCurrentInBounds > 0) {
        if (countCurrentInBoundsEncourse > 0) {
          const min = Math.round(minCurrentInBounds / 60);
          const max = Math.round(maxCurrentInBounds / 60);
          msg = min === max ? ["live.delay1", min] : ["live.delay2", min, max];
        } else {
          msg = ["live.delay1", Math.round(sumCurrentInBounds / countCurrentInBounds / 60)]
        }
      } else {
        msg = ["live.notvisible"];
      }
    }
    store.dispatch({ type: "UPDATE_INDICATOR_MSG", payload: msg });
  }
}
