
var lauttaRoutes;
var lauttaLegs;

function initRoutes(map, data) {

  var lauttaLineSymbol = {
    path: 'M 0,-1 0,1',
    strokeOpacity: 0.4,
    strokeColor: '#e08080',
    scale: 1.5
  };

  var lauttaLineSymbolDimmed = {
    path: 'M 0,-1 0,1',
    strokeOpacity: 0.4,
    strokeColor: '#d00000',
    scale: 1
  };

  function Leg(object) {
    this.id = object.id;
    this.name = object.name;
    this.path = object.path.split(" ").map(function(coord) {
      var latLong = coord.split(","); 
      return new google.maps.LatLng(parseFloat(latLong[1]), parseFloat(latLong[0])); 
    });
    this.isSelected = false;
    this.line = new google.maps.Polyline({
      path: new google.maps.MVCArray(this.path),
      zIndex: 1,
      strokeOpacity: 0,
      strokeWeight: 15,
      icons: [{
        icon: lauttaLineSymbol,
        offset: '4',
        repeat: '4px'
      }],
      cursor: 'context-menu',
      map: map
    });
    this.highlightLine = new google.maps.Polyline({
      path: new google.maps.MVCArray(this.path),
      zIndex: 0,
      strokeOpacity: 0.7,
      strokeWeight: 7,
      strokeColor: '#f97cdc',
      visible: false,
      map: map,
    });
    this.routes = [];
    var that = this;
    this.line.addListener('click', function(event) {
      select(that.routes, event);
    });
    this.rerender = function(zoom, mapTypeId) {
      this.line.setVisible(this.isSelected || (layers.longdistanceferries && zoom >= 7 && zoom <= 11));
      this.line.setOptions({icons: [{
        icon: zoom <= 9? lauttaLineSymbol: lauttaLineSymbolDimmed,
        offset: '4',
        repeat: '4px'
      }]})
      if (!this.line.getVisible()) this.highlightLine.setVisible(false);
    }
  }

  Leg.prototype.highlight = function(doHighlight) {
    this.isSelected = doHighlight;
    this.highlightLine.setVisible(doHighlight);
  }

  Leg.prototype.addRoute = function(route) {
    this.routes.push(route);
  }

  function Route(object) {
    this.operators = object.operators;
    this.legs = object.legs.map(function(id) { return lauttaLegIndex[id]; });
    this.id = object.id;
    this.init = function() {
      this.name = shortName(object);
      this.details = description(object);
      this.operatorId = this.operators[0];
      this.operator = data.lauttaOperators[this.operatorId];
      this.style = { color: "#e08080", weight: 1.5, style: "dotted", opacity: .7 };
    }
    this.init();
  }

  Route.prototype.highlight = function(doHighlight) {
    this.legs.forEach(function(leg) { leg.highlight(doHighlight); });
  }

  Route.prototype.rerender = function(zoom, mapTypeId) {
    this.legs.forEach(function(leg) { leg.rerender(zoom, mapTypeId); });
  }

  lauttaLegs = data.lauttaLegs.map(function(leg) {
    return new Leg(leg);
  });

  lauttaLegIndex = {};
  lauttaLegs.forEach(function(leg) { lauttaLegIndex[leg.id] = leg});

  lauttaRoutes = data.lauttaRoutes.map(function(route) {
    route = new Route(route);
    route.legs.forEach(function(leg) { leg.addRoute(route); });
    return route;
  });  
}
