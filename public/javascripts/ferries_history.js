
var timeout = false;
var mapInitialized = false;

var layers = {
  live: true,
};

var map;

var roadColor = '#8a7d6a';

function createMapStyles(mapTypeId, zoom, settings) {
  return [
    // forests visible
    { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [ 
          {lightness: -15},
          {saturation: -50},
          {hue: '#00ff3b'},
          {gamma: 1.2}
          ]},
    // flat style
    // { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{color: '#b8cbb8'}, {lightness: 20} ]},

    { featureType: 'water', elementType: 'geometry.fill', stylers: [{color: '#edf3ff'}, {lightness: 40}]},

    // { elementType: 'labels', stylers: [{ "visibility": "off" }]},
    // { featureType: 'administrative', elementType: 'labels', stylers: [{ "visibility": zoom <= 7 || zoom >= 13? 'on': 'off' }]},
    // { featureType: 'landscape', elementType: 'labels', stylers: [{ "visibility": zoom >= 13? 'on': 'off' }]},
    { featureType: 'poi', elementType: 'labels', stylers: [{ "visibility": zoom >= 10? 'on': 'off' }]},
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ saturation: -10}]},

    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{color: '#400040'}, {weight: 1}]},
    { featureType: 'transit', stylers: [{ "visibility": "off" }]},

    { featureType: 'road', elementType: 'labels', stylers: [{visibility: 'on'}]},
    { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{color: '#ffffff'}, {weight: 3}]},
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{color: '#000000'}]},
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{color: mapTypeId == google.maps.MapTypeId.ROADMAP? roadColor: roadColorSatellite}]},
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{color: mapTypeId == google.maps.MapTypeId.ROADMAP? roadColor: roadColorSatellite}]},
    { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{visibility: "simplified"}, {weight: zoom <= 7? 0.5: Math.max(0.6, 0.6 + (zoom-7)*0.4)}]},
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{visibility: "simplified"}, {weight: 0.1}]},
    { featureType: 'road.highway.controlled_access', elementType: 'geometry.fill', stylers: [{visibility: "simplified"}, {weight: zoom <= 6? 0.7: Math.max(0.8, 0.8 + (zoom-6)*0.55)}]},
    { featureType: 'road.highway.controlled_access', elementType: 'geometry.stroke', stylers: [{visibility: "simplified"}, {weight: 0.2}]},
    { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{visiblity: "simplified"}, {weight: Math.max(0.8, 0.8 + (zoom-9)*0.3)}]},
    { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{visiblity: "simplified"}, {weight: 0.1}]},
    { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{visiblity: "simplified"}, {weight: 0.8}]},
    { featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{visiblity: "simplified"}, {weight: 0.1}]}
  ];
}

function updateMapStyles() {
  map.setOptions({styles: createMapStyles(map.getMapTypeId(), map.getZoom(), {})});
  $("div.gm-style").css({'font-size': map.getZoom()+1});
}

var mapOptions = {
  center: {lat: 60.25, lng: 21.25},
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

function resetMap() {
  map.setMapTypeId("MMLTAUSTA");
  map.setOptions(mapOptions);
  map.fitBounds({south: 60, north: 60.5, west: 20, east: 22.3});
}

function initMap() {

  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  initMapTypes(map);

  resetMap();

  updateMapStyles();
  map.addListener('zoom_changed', updateMapStyles);

  toggleLiveLayer(true);
}

function toggleLiveLayer() {
  loadLiveData(map);

  map.data.setStyle(function(feature) {
    return {
      visible: true,
      strokeColor: '#c05050',
      strokeWeight: 0.5,
      strokeOpacity: 0.2,
      zIndex: 99,
      clickable: false
    };
  });

}

function loadLiveData(map) {
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_209293000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_219026000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_229678000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230006380.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230011480.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230028850.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230035100.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230035990.json');
  map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230051080.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230052810.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230090460.json');
  map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230103660.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230110440.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230112970.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230113760.json');
  map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230117660.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230128770.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230129940.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230172000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230180000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230181000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230184000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230359000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230361000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230610000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230629000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230634000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230637000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230639000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230655000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230668000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230671000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230914000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230938210.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230938240.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230938250.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230938590.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230938610.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230939360.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_23093936.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230939370.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230940560.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230941090.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230943610.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230980000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230980760.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230981050.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230981150.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230981160.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230987260.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230987380.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230987390.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230987410.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230987550.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230987870.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230988090.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230990880.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230992580.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230992590.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230992610.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230992640.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230992670.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230992680.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230992690.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230992710.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230992740.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230992750.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230993790.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230994870.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_230994880.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_235103357.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_235106595.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_236611000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_244126000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_244828000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_244830547.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_245304000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_246396000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_247113300.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_247117300.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_247187700.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_247258100.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_247312900.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_247385600.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_248513000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_248939000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_248953000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_249639000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_249666000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_249973000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_256878000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_257274400.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_259769000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_259890000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_263024000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_265004000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_265795810.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_266009000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_266027000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_266192000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_266301000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_266308000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_266314000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_276519000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_276554000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_276779000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_276817000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_277449000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_308784000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_308814000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_309908000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_309964000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_310610000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_310625000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_310674000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_311000585.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_311022500.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_311083000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_311361000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_311492000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_311536000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_311541000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_311743000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_371861000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_372497000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_376439000.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_538003668.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_538007668.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_563041800.json');
  // map.data.loadGeoJson('https://live.saaristolautat.fi/summer2018/history_636091104.json');
}

function initMapTypes(map) {

  function createGetMMLTileUrl(tileDir) {
    return function(coord, zoom) {
      var tilesPerGlobe = 1 << zoom;
      var x = coord.x % tilesPerGlobe;
      if (x < 0) x = tilesPerGlobe+x;

      x0 = ((x+1) << (15-zoom)) - 1
      x1 = x << (15-zoom)
      y0 = ((coord.y+1) << (15 - zoom)) - 1
      y1 = coord.y << (15 - zoom)

      if (zoom < 8 || x0 < 18154 || x1 >= 18528 || y0 < 9376 || y1 >= 9568)
        return "http://tile.openstreetmap.org/" + zoom + "/" + x + "/" + coord.y + ".png";
      else
        return "http://tiles.saaristolautat.fi/" + tileDir + "/" + zoom + "/" + x + "/" + coord.y + ".png";
    }
  }

  var copyrights = {
    MML: 'Taustakartan aineisto <a href="http://www.maanmittauslaitos.fi/" target="_blank">Maanmittauslaitos</a> 12/2017',
    OSM: '© <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
  }

  var mapTypeCopyrights = {
    MMLTAUSTA: copyrights.OSM + ", " + copyrights.MML,
    MMLMAASTO: copyrights.OSM + ", " + copyrights.MML,
    OSM: copyrights.OSM
  }

  function setCopyrights(innerHTML) {
    if (!innerHTML) innerHTML = ""

    var control = map.controls[google.maps.ControlPosition.BOTTOM_RIGHT];
    if (control.getLength() > 0) control.pop();

    var outerdiv = document.createElement("div");
    outerdiv.style.fontSize = "11px";
    outerdiv.style.whiteSpace = "nowrap";
    outerdiv.style.padding = "2px";
    var copyright = document.createElement("span");
    copyright.style.color = "#000";
    copyright.style.background="#fff";
    copyright.style.opacity =0.8;
    copyright.innerHTML = innerHTML;
    outerdiv.appendChild(copyright);
    control.push(outerdiv);
  }  

  //Define OSM map type pointing at the OpenStreetMap tile server
  map.mapTypes.set("OSM", new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
      var tilesPerGlobe = 1 << zoom;
      var x = coord.x % tilesPerGlobe;
      if (x < 0) {
        x = tilesPerGlobe+x;
      }

      return "http://tile.openstreetmap.org/" + zoom + "/" + x + "/" + coord.y + ".png";
    },
    tileSize: new google.maps.Size(256, 256),
    name: "OpenStreetMap",
    maxZoom: 15
  }));

  //Define OSM map type pointing at the OpenStreetMap tile server
  map.mapTypes.set("MMLTAUSTA", new google.maps.ImageMapType({
    getTileUrl: createGetMMLTileUrl("taustakartta"),
    tileSize: new google.maps.Size(256, 256),
    name: "MML tausta",
    minZoom: 4,
    maxZoom: 15,
    opacity: 1
  }));


  //Define OSM map type pointing at the OpenStreetMap tile server
  map.mapTypes.set("MMLMAASTO", new google.maps.ImageMapType({
    getTileUrl: createGetMMLTileUrl("peruskartta"),
    tileSize: new google.maps.Size(256, 256),
    name: "MML maasto",
    minZoom: 4,
    maxZoom: 15,
    opacity: 1,
    copyright: "testi"
  }));

  map.addListener('maptypeid_changed', function() {
    setCopyrights(mapTypeCopyrights[map.getMapTypeId()]);
  });
}
