function initObjectRenderer(map) {

  function createCircleIcon(color, opacity, scale, labelOrigin) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      strokeWeight: 0,
      fillColor: color,
      fillOpacity: opacity,
      scale: scale,
      labelOrigin: labelOrigin
    };
  }

  function createMarker(position, clickable, icon, map) {
    return new google.maps.Marker({
      position: position,
      clickable: clickable,
      icon: icon,
      map: map,
      cursor: clickable? 'pointer': 'default',
    });
  }

  function getLabelColor(mapTypeId) {
    return mapTypeId == 'hybrid' || mapTypeId == 'satellite'? '#aaaa00': '#002080';
  }


  // object renderers

  function road(feature, map) {
    var roadCoords = feature.geometry.coordinates.map(function(coord) { return new google.maps.LatLng(coord[1], coord[0]); });
    var roadObject = new google.maps.Polyline({
      path: new google.maps.MVCArray(roadCoords),
      geodesic: false,
      strokeColor: roadColor,
      strokeOpacity: 1,
      strokeWeight: 1,
      zIndex: 0,
      map: map,
      clickable: false
    });
    var minZ = feature.properties.minZ || 8;
    var maxZ = feature.properties.maxZ || 8;
    return {
      rerender: function(zoom, mapTypeId) {
        var addZ = mapTypeId == 'hybrid'? 2: 0;
        roadObject.setVisible(zoom >= minZ + addZ && zoom <= maxZ + addZ);
        roadObject.setOptions({strokeColor: mapTypeId == google.maps.MapTypeId.ROADMAP? roadColor: roadColorSatellite});
      }
    };
  }

  function route(feature, map) {
    var coords = feature.geometry.coordinates.map(function(coord) { return new google.maps.LatLng(coord[1], coord[0]); });
    var object = new google.maps.Polyline({
      path: new google.maps.MVCArray(coords),
      geodesic: false,
      strokeColor: '#202020',
      strokeOpacity: 0.4,
      strokeWeight: 1,
      zIndex: 0,
      map: map,
      cursor: 'context-menu',
      clickable: true
    });
    return {
      rerender: function(zoom, mapTypeId) {
        object.setVisible(layers.ringroads && zoom >= 8);
        object.setOptions({strokeWeight: (zoom<=8? 2: zoom<=9? 2.5: 3)});
      }
    };
  }

  // Define a symbol using SVG path notation, with an opacity of 1.
  var borderLineSymbol = {
    path: 'M 0,-4 0,0',
    strokeOpacity: 0.4,
    strokeColor: '#808080',
    scale: 1
  };

  function border(feature, map) {
    var coords = feature.geometry.coordinates.map(function(coord) { return new google.maps.LatLng(coord[1], coord[0]); });
    var object = new google.maps.Polyline({
      path: new google.maps.MVCArray(coords),
      geodesic: false,
      zIndex: 0,
      map: map,
      clickable: false,
      strokeOpacity: 0,
      icons: [{
        icon: borderLineSymbol,
        offset: '0',
        repeat: '8px'
      }],
    });
    return {
      rerender: function(zoom, mapTypeId) {
        object.setVisible(zoom >= 7 && zoom <= 30);
        borderLineSymbol.opacity = 1;
      }
    };
  }

  var pierIcons;
  function getPierIcons() {
    if (pierIcons) return pierIcons;
    pierIcons = {
      a1_08: createCircleIcon('#e00000', 1, 3, null),
      a1_10: createCircleIcon('#e00000', 1, 4, null),
      a1_11: createCircleIcon('#e00000', 0.8, 5, null),
      a1_30: createCircleIcon('#e00000', 0.8, 6, null),
      a2_09: createCircleIcon('#e00000', 0.5, 3, null),
      a2_10: createCircleIcon('#e00000', 0.5, 3.5, null),
      a2_11: createCircleIcon('#e00000', 0.5, 4, null),
      a2_12: createCircleIcon('#e00000', 0.8, 4, null),
      a2_30: createCircleIcon('#e00000', 0.8, 5, null),
      a3_09: createCircleIcon('#e00000', 0.5, 2.5, null),
      a3_10: createCircleIcon('#e00000', 0.5, 3, null),
      a3_12: createCircleIcon('#e00000', 0.5, 3.5, null),
      a3_30: createCircleIcon('#e00000', 0.8, 4.5, null),
      a4_09: createCircleIcon('#e00000', 0.5, 1, null),
      a4_10: createCircleIcon('#e00000', 0.5, 2, null),
      a4_11: createCircleIcon('#e00000', 0.5, 3, null),
      a4_12: createCircleIcon('#e00000', 0.5, 4, null),
      a4_30: createCircleIcon('#e00000', 0.8, 4, null),
      a5_30: createCircleIcon('#e00000', 0, 0, null),
    }
    return pierIcons;
  }

  var pierStylers = {
    "1": {
      markerVisibleFrom: 8,
      labelVisibleFrom: 8,
      markerScale: function(zoom) {return zoom <= 8? 3: zoom <= 10? 4: zoom <= 11? 5: 6;},
      markerOpacity: function(zoom) {return zoom <= 10? 1 : 0.8;},
      icon: function(zoom) { return getPierIcons()[zoom <= 8? "a1_08": zoom <= 10? "a1_10": zoom <= 11? "a1_11": "a1_30"]; },
      clickable: function(zoom) { return true; }
    },
    "2":  {
      markerVisibleFrom: 9,
      labelVisibleFrom: 9,
      markerScale:  function(zoom) {return zoom <= 9? 3: zoom <= 10? 3.5: zoom <= 12? 4: 5;},
      markerOpacity: function(zoom) {return zoom <= 11? 0.5: 0.8; },
      icon: function(zoom) { return getPierIcons()[zoom <= 9? "a2_09": zoom <= 10? "a2_10": zoom <= 11? "a2_11": zoom <= 12? "a2_12": "a2_30"]; },
      clickable: function(zoom) { return true; }
    },
    "3": {
      markerVisibleFrom: 9,
      labelVisibleFrom: 10,
      markerScale:  function(zoom) {return (zoom <= 9? 2.5: zoom <= 10? 3: zoom <= 12? 3.5: 4.5);},
      markerOpacity: function(zoom) {return zoom <= 12? 0.5: 0.8; },
      icon: function(zoom) { return getPierIcons()[zoom <= 9? "a3_09": zoom <= 10? "a3_10": zoom <= 12? "a3_12": "a3_30"]; },
      clickable: function(zoom) { return true; }
    },
    "4": {
      markerVisibleFrom: 9,
      labelVisibleFrom: 11,
      markerScale:  function(zoom) {return (zoom <= 9? 1: zoom <= 10? 2: zoom <= 11? 3: 4);},
      markerOpacity: function(zoom) {return  zoom <= 12? 0.5: 0.8},
      icon: function(zoom) { return getPierIcons()[zoom <= 9? "a4_09": zoom <= 10? "a4_10": zoom <= 11? "a4_11": zoom <= 12? "a4_12": "a4_30"]; },
      clickable: function(zoom) { return zoom >= 10; }
    },
    "5": {
      markerVisibleFrom: 30,
      labelVisibleFrom: 11,
      markerScale:  function(zoom) {return 0;},
      markerOpacity: function(zoom) {return  0;},
      icon: function(zoom) { return getPierIcons()["a5_30"]; },
      clickable: function(zoom) { return true; }
    }
  };

  function pier(feature, map, data) {
    var styler = pierStylers[feature.properties.ssubtype];
    var markerVisibleFrom = feature.properties.markerVisibleFrom || styler.markerVisibleFrom;
    var labelVisibleFrom = feature.properties.labelVisibleFrom || styler.labelVisibleFrom;
    var coords = feature.geometry.coordinates;
    var position = new google.maps.LatLng(coords[1], coords[0]);
    var icon = getPierIcons().a1_30;
    var marker = createMarker(position, true, icon, map);
    var ref = null;
    var dataObject = null;
    if (feature.properties.ref) {
      ref = feature.properties.ref;
      dataObject = data.piers[ref];    
    }
    var shortName_ = shortName(dataObject);
    var longName_ = longName(dataObject).replace('/', '<br/>');
    var label = new txtol.TxtOverlay(position, longName_, "pier pier-" + feature.properties.ssubtype, map, feature.properties.labelAnchor);

    function showTooltip(pan) {
      tooltip.setPosition(marker.getPosition());
      tooltip.setContent(longName_);
      tooltip.open(map, marker);
      if (pan) {
        map.panTo(marker.getPosition());
      }
    }

    marker.addListener('click', function() { latestHandledMapClickAt = new Date().getTime(); showTooltip(); });
    label.addEventListener('click', function(event) { event.stopPropagation(); event.preventDefault(); latestHandledMapClickAt = new Date().getTime(); showTooltip(); });
    return {
      ref: ref,
      init: function() {
        shortName_ = shortName(dataObject);
        longName_ = longName(dataObject).replace('/', '<br/>');
        label.setInnerHTML(longName_);
      },
      hide: function() {
        marker.setVisible(false);
        label.hide();
      },
      rerender: function(zoom, mapTypeId) {
        marker.setIcon(styler.icon(zoom));
        marker.setClickable(styler.clickable(zoom));
        marker.setVisible(zoom >= markerVisibleFrom);
        if (zoom >= labelVisibleFrom) label.show(); else label.hide();
      },
      showTooltip: showTooltip,
      id: dataObject.id
    };
  }

  var lineWeightUnit = 1.5;

  var connectionStylers = {
    "base": {
      visibleFrom: 8,
      visibleTo: 30,
      weight: 3.5 * lineWeightUnit,
      color: '#f08000',
      opacity: 0.7,
      zIndex: 10,
      highlightColor: '#f97cdc',
      highlightWeight: 8,
      highlightOpacity: .7,
      layer: "roadferries"
    },
    "conn1": {
    },
    "conn1b": {
      weight: 2 * lineWeightUnit,
      zIndex: 12
    },
    "conn2": {
      weight: 2.5 * lineWeightUnit,
      color: '#005dd8'
    },
    "conn2m": {
      weight: 2 * lineWeightUnit,
      color: '#ff7c0a',
    },
    "conn2b": {
      weight: 1.5 * lineWeightUnit,
      zIndex: 10
    },
    "conn3": {
      // visibleFrom: 9,
      weight: 2 * lineWeightUnit,
      color: '#e7883e',
      opacity: 1
    },
    "conn4": {
      // visibleFrom: 9,
      weight: 1.5 * lineWeightUnit,
      color: '#7fb3e8',
      opacity: 0.8,
      zIndex: 9,
      layer: "conn4"
    },
    "conn5": {
      visibleFrom: 9,
      icons: [{
        icon: {
          path: 'M 0,-1.5 0,1.5',
          strokeOpacity: 1,
          strokeColor: '#ff7c0a',
          strokeWeight: 1 * lineWeightUnit,
          scale: 1
        },
        offset: '0',
        repeat: '8px'
      }],
      zIndex: 7,
      layer: "conn5",
      style: { color: "#ff7c0a", weight: 2, style: "dashed", opacity: 1 }
    },
    "conn50": {
      visibleFrom: 9,
      zIndex: 8,
      layer: "conn5",
      opacity: 0,
      style: { color: "#ff7c0a", weight: 2, style: "dashed", opacity: 1 }
    },
    "cableferry": {
      visibleFrom: 9,
      icons: [{
        icon: {
          path: 0, // circle. cannot refer to google.maps.SymbolPath.CIRCLE before map has been loaded
          strokeOpacity: 1,
          strokeColor: '#00a050',
          strokeWeight: 1.5 * lineWeightUnit,
          scale: 1.5 * lineWeightUnit
        },
        offset: '0',
        repeat: (3*lineWeightUnit) + 'px'
      }],
      highlightWeight: 10,
      zIndex: 11,
      layer: "roadferries",
      style: { color: "#00a050", weight: 3*lineWeightUnit, style: "dotted", opacity: 1 },
    }

  };

  function pickProperty(name, sources) {
    for (var i in sources) {
      if (typeof sources[i][name] !== 'undefined') return sources[i][name];
    }
  }

  function pickProperties(names, sources) {
    var result = {};
    names.forEach(function(name) {
      result[name] = pickProperty(name, sources);
    });
    return result;
  }

  function addToBounds(bounds, coords) {
    coords.forEach(function(coord) {
      bounds.west = bounds.west? Math.min(bounds.west, coord[0]): coord[0];
      bounds.east = bounds.east? Math.max(bounds.east, coord[0]): coord[0];
      bounds.south = bounds.south? Math.min(bounds.south, coord[1]): coord[1];
      bounds.north = bounds.north? Math.max(bounds.north, coord[1]): coord[1];
    });
  }

  function connection(connection, map) {
    var baseStyler = connectionStylers["base"];
    var subtype = connection.properties.ssubtype;
    var connectionStyler = subtype? connectionStylers[subtype]: baseStyler;
    var layer = connectionStyler.layer || baseStyler.layer;
    var layerSelector = function() {
      return layers[layer]; 
    };

    var legFeatures = connection.type === 'FeatureCollection'? connection.features: [connection];
    var connectionObject = { ref: connection.properties.ref, bounds: {} };
    var legObjects = legFeatures.map(function(leg) {

      var coords = leg.geometry.coordinates.map(function(coord) { return new google.maps.LatLng(coord[1], coord[0]); });
      addToBounds(connectionObject.bounds, leg.geometry.coordinates);
      var legStyler = leg.properties.ssubtype? connectionStylers[leg.properties.ssubtype]: {};
      var propertyNames = ["weight", "opacity", "color", "zIndex", "visibleFrom", "visibleTo", "highlightColor", "highlightWeight", "highlightOpacity", "icons"];
      var propertySources = [leg.properties, legStyler, connection.properties, connectionStyler, baseStyler]
      var properties = pickProperties(propertyNames, propertySources);
      var isSelected = false;
      connectionObject.style = connectionStyler.style || { color: properties.color, weight: properties.weight, style: "solid", opacity: properties.opacity };

      var line = new google.maps.Polyline({
        path: new google.maps.MVCArray(coords),
        geodesic: false,
        strokeColor: properties.color,
        strokeOpacity: !properties.icons? properties.opacity: 0,
        strokeWeight: properties.weight,
        zIndex: properties.zIndex,
        clickable: false,
        icons: properties.icons,
        map: map
      });
      var lineb = new google.maps.Polyline({
        path: new google.maps.MVCArray(coords),
        geodesic: false,
        strokeOpacity: 0,
        strokeWeight: properties.highlightWeight + properties.weight,
        strokeColor: properties.highlightColor,
        zIndex: properties.zIndex - 1,
        cursor: 'context-menu',
        map: map
      });
      var highlight = function(doHighlight) {
        isSelected = doHighlight;
        lineb.setOptions({strokeOpacity: doHighlight? properties.highlightOpacity: 0});
        rerender(map.getZoom(), map.getMapTypeId());
      };
      lineb.addListener('click', function(event) {
        select([connectionObject], event);
      });
      var rerender = function(zoom, mapTypeId) {
        if (properties.icons) {
          properties.icons[0].icon.strokeOpacity = layers.live? 0.4: 1;
          line.setOptions({icons: properties.icons});
        } else {
          line.setOptions({strokeOpacity: Math.min(properties.opacity, layers.live? 0.2: 1)});
        }
        var lineIsVisible = isSelected || (layerSelector() && zoom >= properties.visibleFrom && zoom <= properties.visibleTo);
        line.setVisible(lineIsVisible);
        lineb.setVisible(lineIsVisible);        
      }
      return {highlight: highlight, rerender: rerender };
    });
    connectionObject.highlight = function(doHighlight) {
      legObjects.forEach(function(leg) { leg.highlight(doHighlight); });
    }

    connectionObject.rerender = function(zoom, mapTypeId) {
      legObjects.forEach(function(leg) { leg.rerender(zoom, mapTypeId); });
    }

    connectionObject.init = function() {
      connectionObject.name = shortName(connection.properties);
    }

    return connectionObject;
  }

  var _pinPaths = {
    n:  "M 0 0 L -1.4 -27 A 6 6, 0, 1, 1, 1.4 -27 L 0 0 Z",
    e:  "M 0 0 L 27 -1.4 A 6 6, 0, 1, 1, 27 1.4 L 0 0 Z",
    s:  "M 0 0 L -1.4 27 A 6 6, 0, 1, 0, 1.4 27 L 0 0 Z",
    w:  "M 0 0 L -27 -1.4 A 6 6, 0, 1, 0, -27 1.4 L 0 0 Z",
    se: "M 0 0 L 18 20 A 6 6, 0, 1, 0, 20 18 L 0 0 Z",
    ne: "M 0 0 L 18 -20 A 6 6, 0, 1, 1, 20 -18 L 0 0 Z",
    nw: "M 0 0 L -18 -20 A 6 6, 0, 1, 0, -20 -18 L 0 0 Z",
    sw: "M 0 0 L -18 20 A 6 6, 0, 1, 1, -20 18 L 0 0 Z"
  }

  var _pinSymbols = {};
  function pinSymbol(dir) {
    _pinSymbols[dir] = _pinSymbols[dir] || {
      path: _pinPaths[dir],
      strokeOpacity: 1,
      strokeColor: '#0000d0',
      strokeWeight: 1,
      fillColor: '#0000d0',
      fillOpacity: 0.5,
      scale: 0.6
    };
    return _pinSymbols[dir];
  }

  function pin(feature, map) {
    var coords = feature.geometry.coordinates;
    var position = new google.maps.LatLng(coords[1], coords[0]);
    var marker = createMarker(position, false, pinSymbol(feature.properties.ssubtype), map);
    return {
      hide: function() {
        marker.setVisible(false);
      },
      rerender: function(zoom, mapTypeId) {
        marker.setVisible(layers.distances && zoom >= 11);
      }
    };
  }

  var areaStylers = {
    "base": {
      labelVisibleFrom: 9,
      labelVisibleTo: 30,
      longNameFrom: 9
    },
    "province": {
      labelVisibleFrom: 5,
      labelVisibleTo: 10
    },
    "mun1": {
      labelVisibleFrom: 1,
    },
    "mun2": {
      labelVisibleFrom: 8,
    },
    "island1": {
      labelVisibleFrom: 9,
    },
  };

  function area(feature, map) {
    var baseStyler = areaStylers["base"];
    var styler = areaStylers[feature.properties.ssubtype];
    var propertyNames = ["labelVisibleFrom", "labelVisibleTo", "longNameFrom"];
    var propertySources = [feature.properties, styler, baseStyler];
    var properties = pickProperties(propertyNames, propertySources);
    var coords = feature.geometry.coordinates;
    var position = new google.maps.LatLng(coords[1], coords[0]);
    var shortName_ = shortName(feature.properties);
    var longName_ = longName(feature.properties).replace('/', '<br/>');
    var label = new txtol.TxtOverlay(
      position, longName_, "area " + feature.properties.ssubtype + (feature.properties.background? " bg": ""), map, feature.properties.labelAnchor);
    return {
      init: function() {
        shortName_ = shortName(feature.properties);
        longName_ = longName(feature.properties).replace('/', '<br/>');
      },
      hide: function(zoom) {
        if (zoom >= properties.labelVisibleFrom && zoom <= properties.labelVisibleTo) label.show(); else label.hide();
      },
      rerender: function(zoom, mapTypeId) {
        label.setInnerHTML(zoom >= properties.longNameFrom? longName_: shortName_);
        if (zoom >= properties.labelVisibleFrom && zoom <= properties.labelVisibleTo && ["roadmap", "hybrid", "terrain", "satellite"].indexOf(mapTypeId)>=0) label.show(); else label.hide();      
      }
    };
  }

  var boxStylers = {
    "distance": {
      visibleFrom: 11,
      visibleTo: 15,
    },
  };

  function box(feature, map) {
    var styler = boxStylers[feature.properties.ssubtype];
    var visibleFrom = feature.properties.visibleFrom || styler.visibleFrom;
    var visibleTo = feature.properties.visibleTo || styler.visibleTo;
    var coords = feature.geometry.coordinates;
    var position = new google.maps.LatLng(coords[1], coords[0]);
    var box = new txtol.TxtOverlay(
      position, description(feature.properties), "distancebox", map, feature.properties.anchor);
    return {
      init: function() {
        box.setInnerHTML(description(feature.properties));
      },
      hide: function() {
        box.hide();
      },
      rerender: function(zoom, mapTypeId) {
        if (layers.distances && zoom >= visibleFrom && zoom <= visibleTo) box.show(); else box.hide();
      }
    };
  }

  var renderers = {
    road: road,
    route: route,
    border: border,
    pier: pier,
    connection: connection,
    area: area,
    box: box,
    pin: pin
  };

  function renderFeatureCollection(featureCollection, data, objects) {
    var features = featureCollection.features;
    features.forEach(function(feature) {
      var type = feature.properties.stype;
      if (typeof renderers[type] !== 'undefined') {
        objects.push(renderers[type](feature, map, data));
      }
    });
  }

  return {
    renderData: function(geojson, data, objects) {
      geojson.forEach(function(featureCollection) {
        renderFeatureCollection(featureCollection, data, objects);
      });
    }
  }
}
