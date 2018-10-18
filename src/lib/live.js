import { layers, L2 } from './ferries';

export function initLiveLayer(map, txtol, liveIndicator) {

  var LIVE_MIN_ZOOM = 8;
  var LIVE_LABEL_MIN_ZOOM = 9;
  var liveInterval = null;
  var liveLoadCount = 0;

  map.addListener('idle', updateLiveInd);

  function toggleLiveLayer(enable) {

    if (liveInterval) {
      clearInterval(liveInterval);
      liveInterval = null;
    }

    if (enable) {
      if (typeof liveIndicator !== 'undefined' && typeof L !== 'undefined') liveIndicator.setText(L2("live.loading"));
      loadLiveData(map);
      liveInterval = setInterval(function() { loadLiveData(map); }, 10000);
    } else {
      liveIndicator.setText("");
      map.data.forEach(function(feature) {
        map.data.remove(feature);
      });
      Object.values(vesselLabels).forEach(function(l) { l.hide(); });
      liveLoadCount = 0;
    }

    map.data.setStyle(function(feature) {
      var isVessel = feature.getGeometry().getType() === 'Point';
      var isVisible = vesselIsVisible(feature);
      var isLabelVisible = map.getZoom() >= LIVE_LABEL_MIN_ZOOM && isVisible;
      if (isVessel) updateVesselLabel(map, feature, isLabelVisible);
      return {
        visible: isVisible,
        strokeColor: '#a0a0a0',
        strokeWeight: 0.5,
        icon: isVisible && isVessel? createVesselIcon(feature): null,
        zIndex: isVessel? 100: 99,
        clickable: false
      };
    });

  }

  function vesselIsVisible(feature) {
    if (feature.getGeometry().getType() === 'Point') {
      return map.getZoom() >= LIVE_MIN_ZOOM && vesselIsCurrent(feature);
    } else {
      return map.getZoom() >= LIVE_MIN_ZOOM;
    }
  }

  var vesselLabels = {};

  function loadLiveData(map) {
    map.data.loadGeoJson('https://live.saaristolautat.fi/livedata.json',
      {idPropertyName: "mmsi"},
      function () {
        liveLoadCount++;
        updateLiveInd();
      });
    map.data.loadGeoJson('https://live.saaristolautat.fi/livehistory.json');
  }

  function updateLiveInd() {
    if (typeof liveIndicator === 'undefined') return;
    if (!liveLoadCount) return;
    if (!layers || !layers.live) {
      liveIndicator.setText("");
      return;
    }
    var sumCurrentInBounds = 0;
    var countCurrentInBounds = 0;
    var countCurrentInBoundsEncourse = 0;
    var countCurrentTotal = 0;
    var minCurrentInBounds = 1000;
    var maxCurrentInBounds = -1;
    map.data.forEach(function(feature) {
      var isVessel = feature.getGeometry().getType() === 'Point';
      if (isVessel) {
        var isCurrent = vesselIsCurrent(feature);
        if (isCurrent) countCurrentTotal++; 
        if (map.getBounds().contains(feature.getGeometry().get())) {
          if (isCurrent) {
            var age = getVesselAge(feature);
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

    var msg = ["live.notavailable"];
    if (countCurrentTotal > 0) {
      if (map.getZoom() < LIVE_MIN_ZOOM) {
        msg = [ "live.zoomin"];
      } else if (countCurrentInBounds > 0) {
        if (countCurrentInBoundsEncourse > 0) {
          var min = Math.round(minCurrentInBounds/60);
          var max = Math.round(maxCurrentInBounds/60);
          msg = min === max? ["live.delay1", min]: ["live.delay2", min, max];
        } else {
          msg = ["live.delay1", Math.round(sumCurrentInBounds/countCurrentInBounds/60)]
        }
      } else {
        msg = ["live.notvisible"];
      }
    }
    liveIndicator.setText(L2(msg));
  }

  function updateVesselLabel(map, feature, isVisible) {
    var vessel = feature.getProperty("vessel");
    var ageClass = vesselIsCurrent(feature)? "current": "old";
    var speed = feature.getProperty("sog");
    var name = vessel.name;
    var mmsi = vessel.mmsi;
    var position = feature.getGeometry().get();
    var classes = "vessel " + ageClass + (speed <= 0.1? " stopped": "");
    var label;
    if (vesselLabels[mmsi]) {
      label = vesselLabels[mmsi];
      label.setPosition(position);
      label.setClass(classes);
      label.draw();
    } else {
      label = new txtol.TxtOverlay(position, name, classes, map, {dir: 'NW', x: -5, y: -5});
      vesselLabels[mmsi] = label;
    }
    if (isVisible) label.show(); else label.hide();
  }

  function createVesselIcon(feature) {
    var speed = feature.getProperty("sog");
    var relOpacity = Math.max(0.3, 1 - 0.7*Math.max(0, getVesselAge(feature)-180)/600);
    var color = map.getMapTypeId() === 'satellite'? '#80b0a0': '#a030ff';
    var hasSpeed = speed > 0.1;
    var scale = hasSpeed? 3: 2;
    var rotation = hasSpeed? feature.getProperty("cog"): 45;
    var path = hasSpeed? "M -1 2 L -1 -2 0 -3 1 -2 1 2 0 1 -1 2": "M -1 -1 L 1 -1 1 1 -1 1 -1 -1";
    return {
      path: path,
      rotation: rotation,
      strokeWeight: 1,
      strokeColor: color,
      strokeOpacity: 1 * relOpacity,
      fillColor: color,
      fillOpacity: 0.6 * relOpacity,
      scale: scale * (map.getZoom() < 9? 0.6: map.getZoom()/10) 
    };
  }

  function vesselIsCurrent(feature) {
    return getVesselAge(feature) < 600;
  }

  function getVesselAge(feature) {
    var timestamp = feature.getProperty("timestampExternal")
    if (timestamp)
      return Math.max(0, Date.now() - timestamp) / 1000;
    else
      return 86400;
  }

  return {
    toggleLiveLayer: toggleLiveLayer,
    updateLiveInd: updateLiveInd
  }
}
