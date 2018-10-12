
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
