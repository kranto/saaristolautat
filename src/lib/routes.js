import { shortName, description } from './datautils';
import { select } from './ferries';
import store from '../store';
import styles from './styles';

export let lauttaLegs = [];
export let lauttaRoutes = [];

export function initRoutes(map) {
  const google = window.google;

  function Leg(legData) {
    this.id = legData.id;
    this.name = legData.name;
    this.path = legData.path.split(" ").map(function (coord) {
      var latLong = coord.split(",");
      return new google.maps.LatLng(parseFloat(latLong[1]), parseFloat(latLong[0]));
    });
    this.isSelected = false;
    this.line = new google.maps.Polyline({
      ...styles.lauttaLine.init,
      path: new google.maps.MVCArray(this.path),
      map: map
    });
    this.highlightLine = new google.maps.Polyline({
      ...styles.lauttaHighlightLine.init,
      path: new google.maps.MVCArray(this.path),
      map: map
    });
    this.routes = [];
    this.line.addListener('click', (event) => {
      select(this.routes, event);
    });
    this.rerender = function (zoom, mapTypeId, layers) {
      this.line.setVisible(this.isSelected || (layers.longdistanceferries && zoom >= 7 && zoom <= 11));
      if (!this.line.getVisible()) this.highlightLine.setVisible(false);
    }
  }

  Leg.prototype.highlight = function (doHighlight) {
    this.isSelected = doHighlight;
    this.highlightLine.setVisible(doHighlight);
  }

  Leg.prototype.addRoute = function (route) {
    this.routes.push(route);
  }

  function Route(routeData) {
    this.operators = routeData.operators;
    this.legs = routeData.legs.map(id => lauttaLegIndex[id]);
    this.id = routeData.id;
    this.operatorId = this.operators[0];
    this.operator = data.lauttaOperators[this.operatorId];
    this.style = { color: '#e08080', weight: 1.5, style: "dotted", opacity: .7 };
    this.init = function () {
      this.name = shortName(routeData);
      this.details = description(routeData);
    }
    this.init();
  }

  Route.prototype.highlight = function (doHighlight) {
    this.legs.forEach(function (leg) { leg.highlight(doHighlight); });
  }

  Route.prototype.rerender = function (zoom, mapTypeId, layers) {
    this.legs.forEach(function (leg) { leg.rerender(zoom, mapTypeId, layers); });
  }

  const lauttaLegIndex = {};
  function populateRoutes(data) {
    lauttaLegs = data.lauttaLegs.map(leg => new Leg(leg));

    lauttaLegs.forEach(leg => { lauttaLegIndex[leg.id] = leg });

    lauttaRoutes = data.lauttaRoutes.map(routeData => {
      let route = new Route(routeData);
      route.legs.forEach(leg => leg.addRoute(route));
      return route;
    });
  }

  let unsubscribe;
  let data;
  function onStateChange() {
    data = store.getState().data.data;
    if (data.mun) {
      if (unsubscribe) unsubscribe();
      populateRoutes(data);
    } else if (!unsubscribe) {
      unsubscribe = store.subscribe(onStateChange);
    }
  }
  onStateChange();
}
