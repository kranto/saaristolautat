import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapLibreMap.css';
import { phases } from '../lib/constants';
import { mapDataReady, registerMapNavigation, registerMapPierTooltip, registerMapView } from '../lib/mapnavigation';
import { hideMenuAndSettings } from '../lib/uicontrol';

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const RASTER_BASE_LAYERS = {
  OSM: 'base-osm'
};
const SHOW_MAP_DEBUG = typeof window !== 'undefined' && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
const legacyZoomToMapLibre = zoom => Number(zoom) - 1;
const mapLibreZoomToExternal = zoom => Number(zoom) + 1;
const legacyEmSize = em => ['interpolate', ['linear'], ['zoom'], 4, em * 6, 18, em * 20];
const ROUTE_AREA_BOUNDS = [[19.45, 59.72], [23.05, 60.58]];
const MIN_ROUTE_RENDER_ZOOM = 7;
const HIITTINEN = [22.69, 59.88];
const ARCHIPELAGO_BOUNDS = { south: 59.72, west: 19, north: 60.54, east: 23 };
const noRouteFilter = kind => ['all', ['==', ['get', 'kind'], kind], ['==', ['get', 'ref'], '__no-route__']];

function clearRouteHover(map, hoverPopupRef) {
  map.getCanvas().style.cursor = '';
  if (map.getLayer('route-hover-highlight')) map.setFilter('route-hover-highlight', noRouteFilter('route'));
  if (map.getLayer('cable-ferry-hover-highlight')) map.setFilter('cable-ferry-hover-highlight', noRouteFilter('cable-ferry-highlight'));
  hoverPopupRef.current?.remove();
  hoverPopupRef.current = null;
}

function fitRouteArea(map, options = {}) {
  const padding = options.padding ?? 28;
  const camera = map.cameraForBounds(ROUTE_AREA_BOUNDS, { padding });
  if (!camera) return;

  const isSmallViewport = map.getContainer().clientWidth < 768;
  if (!isSmallViewport || camera.zoom >= MIN_ROUTE_RENDER_ZOOM) {
    map.easeTo({ ...camera, duration: options.duration ?? 0 });
    return;
  }

  const containerWidth = map.getContainer().clientWidth;
  const rightEdge = containerWidth - padding;
  const worldSize = 512 * (2 ** MIN_ROUTE_RENDER_ZOOM);
  const routeCenter = maplibregl.MercatorCoordinate.fromLngLat(camera.center);
  const hiittinen = maplibregl.MercatorCoordinate.fromLngLat(HIITTINEN);
  const finalCenter = new maplibregl.MercatorCoordinate(
    hiittinen.x - (rightEdge - containerWidth / 2) / worldSize,
    routeCenter.y
  ).toLngLat();
  map.easeTo({
    center: finalCenter,
    zoom: MIN_ROUTE_RENDER_ZOOM,
    duration: options.duration ?? 0
  });
}

function customizeBaseMap(map) {
  map.getStyle().layers.forEach(layer => {
    const sourceLayer = layer['source-layer'];
    const layerId = layer.id.toLowerCase();
    const isRoadLabel = layer.type === 'symbol' && (
      sourceLayer === 'transportation_name' ||
      ['road', 'route', 'shield', 'highway', 'transportation'].some(value => layerId.includes(value))
    );

    if (isRoadLabel && layer.layout?.['text-field']) {
      map.setPaintProperty(layer.id, 'text-opacity', 1);
    } else if (layer.type === 'symbol' && layer.layout?.['text-field']) {
      map.setPaintProperty(layer.id, 'text-opacity', ['step', ['zoom'], 1, 7, 0, 12, 1]);
    } else if (layer.type === 'background') {
      map.setPaintProperty(layer.id, 'background-color', '#b8dfc2');
    } else if (sourceLayer === 'water' && layer.type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', '#f3f7fd');
      map.setPaintProperty(layer.id, 'fill-opacity', 1);
    } else if (sourceLayer === 'waterway' && layer.type === 'line') {
      map.setPaintProperty(layer.id, 'line-color', '#dce7f3');
    } else if (sourceLayer === 'landcover' && layer.type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', '#addbb9');
    } else if (sourceLayer === 'landuse' && layer.type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', '#b9ddbf');
    } else if (sourceLayer === 'transportation' && layer.type === 'line') {
      map.setLayerZoomRange(layer.id, Math.min(layer.minzoom ?? 0, 7), layer.maxzoom ?? 24);
      const isCasing = layerId.includes('casing');
      const isMainRoad = ['motorway', 'trunk', 'primary', 'secondary'].some(roadClass => layerId.includes(roadClass));
      map.setPaintProperty(layer.id, 'line-color', isCasing ? '#8b918e' : isMainRoad ? '#9da3a0' : '#b1b6b3');
      map.setPaintProperty(layer.id, 'line-width', isCasing
        ? ['interpolate', ['linear'], ['zoom'], 7, 0.8, 11, 1.8, 15, 4]
        : isMainRoad
          ? ['interpolate', ['linear'], ['zoom'], 7, 0.5, 11, 1.2, 15, 3]
          : ['interpolate', ['linear'], ['zoom'], 9, 0.35, 12, 0.8, 15, 1.8]);
      map.setPaintProperty(layer.id, 'line-opacity', isMainRoad || isCasing ? 0.9 : 0.72);
    }

    if (layer.type === 'symbol' && layer.layout?.['text-field'] && !layer.layout?.['icon-image']) {
      map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(255,255,255,0.95)');
      map.setPaintProperty(layer.id, 'text-halo-width', 1.7);
      map.setPaintProperty(layer.id, 'text-halo-blur', 0.25);
    }
  });

}

function addRasterBaseMaps(map) {
  if (!map.getSource('osm-raster')) map.addSource('osm-raster', {
    type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19,
    attribution: '© OpenStreetMap contributors'
  });
  if (!map.getLayer('base-osm')) map.addLayer({ id: 'base-osm', type: 'raster', source: 'osm-raster', layout: { visibility: 'none' } });
}

function setBaseMap(map, mapTypeId) {
  Object.entries(RASTER_BASE_LAYERS).forEach(([type, layerId]) => {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', mapTypeId === type ? 'visible' : 'none');
  });
}

function localizedName(item = {}, locale = 'fi') {
  const name = item[`name_${locale}`] || item[`sname_${locale}`] || item.name || item.sname || '';
  return name.replace(/<br\s*\/?\s*>/gi, '\n');
}

function localizedLongName(item = {}, locale = 'fi') {
  const firstName = localizedName(item, locale);
  const alternatives = [item.sname, item.sname_fi, item.sname_sv, item.sname_en, item.name, item.name_fi, item.name_sv, item.name_en]
    .map(name => (name || '').replace(/<br\s*\/?\s*>/gi, '\n'))
    .filter((name, index, names) => name && name !== firstName && names.indexOf(name) === index);
  return [firstName, ...alternatives].join('\n');
}

function localizedDescription(item = {}, locale = 'fi') {
  return (item[`description_${locale}`] || item.description || '').replace(/<br\s*\/?\s*>/gi, '\n');
}

const TEXT_ANCHORS = {
  N: 'bottom', NE: 'bottom-left', E: 'left', SE: 'top-left',
  S: 'top', SW: 'top-right', W: 'right', NW: 'bottom-right', C: 'center'
};

function labelProperties(properties) {
  const anchor = properties.labelAnchor || {};
  const direction = anchor.dir || 'C';
  return {
    labelDirection: direction,
    labelTextAnchor: TEXT_ANCHORS[direction] || 'center',
    labelOffset: [(anchor.x || 0) / 12, (anchor.y || 0) / 12]
  };
}

function addCableFerryRingImage(map) {
  if (map.hasImage('cable-ferry-ring')) return;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  context.beginPath();
  context.arc(16, 16, 8, 0, Math.PI * 2);
  context.strokeStyle = '#ffffff';
  context.lineWidth = 7;
  context.stroke();
  context.beginPath();
  context.arc(16, 16, 8, 0, Math.PI * 2);
  context.strokeStyle = '#009b63';
  context.lineWidth = 4;
  context.stroke();
  map.addImage('cable-ferry-ring', context.getImageData(0, 0, 32, 32), { pixelRatio: 2 });
}

function addDirectionalPinImages(map) {
  const vectors = { n: [0, -1], ne: [0.7, -0.7], e: [1, 0], se: [0.7, 0.7], s: [0, 1], sw: [-0.7, 0.7], w: [-1, 0], nw: [-0.7, -0.7] };
  Object.entries(vectors).forEach(([direction, [dx, dy]]) => {
    const imageName = `direction-pin-${direction}`;
    if (map.hasImage(imageName)) return;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.strokeStyle = '#0000d0';
    context.fillStyle = 'rgba(0, 0, 208, 0.5)';
    context.lineWidth = 1;
    const endX = 32 + dx * 26;
    const endY = 32 + dy * 26;
    const perpendicularX = -dy * 1.4;
    const perpendicularY = dx * 1.4;
    context.beginPath();
    context.moveTo(32, 32);
    context.lineTo(endX + perpendicularX, endY + perpendicularY);
    context.lineTo(endX - perpendicularX, endY - perpendicularY);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(32, 32);
    context.lineTo(endX + perpendicularX, endY + perpendicularY);
    context.moveTo(32, 32);
    context.lineTo(endX - perpendicularX, endY - perpendicularY);
    context.stroke();
    context.beginPath();
    context.arc(endX, endY, 4, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    map.addImage(imageName, context.getImageData(0, 0, 64, 64), { pixelRatio: 2 });
  });
}

function addDistanceSignImage(map) {
  if (map.hasImage('distance-sign')) return;
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 36;
  const context = canvas.getContext('2d');
  const radius = 6;
  context.beginPath();
  context.roundRect(3, 3, 42, 30, radius);
  context.fillStyle = 'rgba(0,101,189,0.7)';
  context.fill();
  context.strokeStyle = '#ffffff';
  context.lineWidth = 5;
  context.stroke();
  map.addImage('distance-sign', context.getImageData(0, 0, 48, 36), {
    pixelRatio: 2,
    stretchX: [[12, 36]],
    stretchY: [[12, 24]],
    content: [10, 8, 38, 28]
  });
}

function addLiveVesselImages(map) {
  const addImage = (name, moving) => {
    if (map.hasImage(name)) return;
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const context = canvas.getContext('2d');
    context.translate(20, 20);
    context.beginPath();
    if (moving) {
      context.moveTo(-5, 10);
      context.lineTo(-5, -10);
      context.lineTo(0, -15);
      context.lineTo(5, -10);
      context.lineTo(5, 10);
      context.lineTo(0, 5);
    } else {
      context.moveTo(0, -4.5);
      context.lineTo(4.5, 0);
      context.lineTo(0, 4.5);
      context.lineTo(-4.5, 0);
    }
    context.closePath();
    context.fillStyle = 'rgba(160,48,255,0.65)';
    context.strokeStyle = '#a030ff';
    context.lineWidth = 3;
    context.fill();
    context.stroke();
    map.addImage(name, context.getImageData(0, 0, 40, 40), { pixelRatio: 2 });
  };
  addImage('live-vessel-moving', true);
  addImage('live-vessel-stopped', false);
}

const emptyFeatureCollection = () => ({ type: 'FeatureCollection', features: [] });

function raiseLiveLayers(map) {
  ['live-history', 'live-vessels', 'live-vessel-labels'].forEach(id => {
    if (map.getLayer(id)) map.moveLayer(id);
  });
}

function archipelagoTargetFeature() {
  const center = [21.35, 60.2];
  const longitudeRadius = 2.45;
  const latitudeRadius = 0.72;
  const coordinates = Array.from({ length: 97 }, (_, index) => {
    const angle = index / 96 * Math.PI * 2;
    return [
      center[0] + Math.cos(angle) * longitudeRadius,
      center[1] + Math.sin(angle) * latitudeRadius
    ];
  });
  return {
    type: 'Feature', properties: {},
    geometry: { type: 'Polygon', coordinates: [coordinates] }
  };
}

function addArchipelagoTarget(map) {
  if (!map.getSource('archipelago-target')) map.addSource('archipelago-target', {
    type: 'geojson',
    data: archipelagoTargetFeature()
  });
  if (!map.getLayer('archipelago-target-fill')) map.addLayer({
    id: 'archipelago-target-fill', type: 'fill', source: 'archipelago-target', maxzoom: legacyZoomToMapLibre(8),
    paint: {
      'fill-color': '#279594',
      'fill-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.12, 6, 0.065, 7, 0]
    }
  });
  if (!map.getLayer('archipelago-target-line')) map.addLayer({
    id: 'archipelago-target-line', type: 'line', source: 'archipelago-target', maxzoom: legacyZoomToMapLibre(8),
    paint: {
      'line-color': '#147c7c',
      'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.8, 6, 0.5, 7, 0],
      'line-width': ['interpolate', ['linear'], ['zoom'], 4, 2, 7, 1],
      'line-dasharray': [3, 3]
    }
  });
}

function accuracyCircleFeature(lng, lat, radius) {
  const latitudeRadius = radius / 111320;
  const longitudeRadius = radius / (111320 * Math.cos(lat * Math.PI / 180));
  const coordinates = Array.from({ length: 65 }, (_, index) => {
    const angle = index / 64 * Math.PI * 2;
    return [lng + Math.cos(angle) * longitudeRadius, lat + Math.sin(angle) * latitudeRadius];
  });
  return {
    type: 'Feature', properties: {},
    geometry: { type: 'Polygon', coordinates: [coordinates] }
  };
}
const normalRouteOpacities = new WeakMap();

function updateLiveIndicator(map, features, dispatch) {
  const current = features.filter(feature => feature.properties.age < 600);
  if (!current.length) {
    dispatch({ type: 'UPDATE_INDICATOR_MSG', payload: ['live.notavailable'] });
    return;
  }
  if (map.getZoom() < legacyZoomToMapLibre(8)) {
    dispatch({ type: 'UPDATE_INDICATOR_MSG', payload: ['live.zoomin'] });
    return;
  }
  const visible = current.filter(feature => map.getBounds().contains(feature.geometry.coordinates));
  if (!visible.length) {
    dispatch({ type: 'UPDATE_INDICATOR_MSG', payload: ['live.notvisible'] });
    return;
  }
  const moving = visible.filter(feature => feature.properties.sog > 0.1);
  const ages = (moving.length ? moving : visible).map(feature => feature.properties.age);
  const min = Math.round(Math.min(...ages) / 60);
  const max = Math.round(Math.max(...ages) / 60);
  dispatch({ type: 'UPDATE_INDICATOR_MSG', payload: min === max ? ['live.delay1', min] : ['live.delay2', min, max] });
}

function pointAlongLine(coordinates, fraction) {
  const lengths = coordinates.slice(1).map((coordinate, index) =>
    Math.hypot(coordinate[0] - coordinates[index][0], coordinate[1] - coordinates[index][1]));
  const target = lengths.reduce((sum, length) => sum + length, 0) * fraction;
  let travelled = 0;
  for (let index = 0; index < lengths.length; index += 1) {
    if (travelled + lengths[index] >= target) {
      const part = lengths[index] ? (target - travelled) / lengths[index] : 0;
      return [
        coordinates[index][0] + (coordinates[index + 1][0] - coordinates[index][0]) * part,
        coordinates[index][1] + (coordinates[index + 1][1] - coordinates[index][1]) * part
      ];
    }
    travelled += lengths[index];
  }
  return coordinates[coordinates.length - 1];
}

function cableFerryRingFeatures(feature) {
  if (feature.geometry?.type !== 'LineString') return [];
  const baseZoom = feature.properties.objectMinZoom;
  const levels = [
    { minZoom: baseZoom, fractions: [0.5] },
    { minZoom: baseZoom + 1.5, fractions: [0.25, 0.75] },
    { minZoom: baseZoom + 3.5, fractions: [0.125, 0.375, 0.625, 0.875] }
  ];
  return levels.flatMap(level => level.fractions.map(fraction => ({
    type: 'Feature',
    properties: { kind: 'cable-ferry-ring', minZoom: level.minZoom },
    geometry: { type: 'Point', coordinates: pointAlongLine(feature.geometry.coordinates, fraction) }
  })));
}

function cableFerryHighlightFeature(feature) {
  return {
    type: 'Feature',
    properties: { kind: 'cable-ferry-highlight', ref: feature.properties.ref },
    geometry: { type: 'Point', coordinates: pointAlongLine(feature.geometry.coordinates, 0.5) }
  };
}

function flattenMapData(collections, data, locale) {
  const features = [];

  function visit(item, inherited = {}) {
    if (!item) return;
    const properties = { ...inherited, ...(item.properties || {}) };
    // Some of the original data files intentionally omit the GeoJSON
    // FeatureCollection type. The old renderer treated every object with a
    // features array as a collection, so retain that behaviour here.
    if (item.type === 'FeatureCollection' || Array.isArray(item.features)) {
      (item.features || []).forEach(child => visit(child, properties));
      return;
    }
    if (item.type !== 'Feature' || !item.geometry) return;

    const isPier = properties.stype === 'pier';
    const isPlace = properties.stype === 'area';
    const isRoute = inherited.stype === 'connection' || properties.stype === 'connection';
    const simpleKinds = ['road', 'route', 'border', 'pin', 'box'];
    const isSimpleObject = simpleKinds.includes(properties.stype);
    if (!isPier && !isRoute && !isPlace && !isSimpleObject) return;

    const ref = properties.ref || inherited.ref || '';
    const sourceItem = isPier ? data.piers?.[ref] : isRoute ? data.routes?.[ref] : properties;
    const name = localizedName(sourceItem || properties, locale);
    const longName = localizedLongName(sourceItem || properties, locale);
    if (isPlace && !name) return;
    const pierDefaults = {
      '1': { marker: 8, label: 8 }, '2': { marker: 9, label: 9 },
      '3': { marker: 9, label: 10 }, '4': { marker: 9, label: 11 },
      '5': { marker: 30, label: 11 }
    };
    const placeDefaults = {
      province: { from: 5, to: 10 }, mun1: { from: 1, to: 30 },
      mun2: { from: 8, to: 30 }, island1: { from: 9, to: 30 }
    };
    const subtype = properties.ssubtype || inherited.ssubtype || '';
    const layerTarget = subtype === 'conn4' ? 'conn4' : ['conn5', 'conn50'].includes(subtype) ? 'conn5' : 'roadferries';
    const simpleKind = properties.stype === 'route' ? 'ringroad' : properties.stype;
    const placement = properties.anchor ? labelProperties({ labelAnchor: properties.anchor }) : labelProperties(properties);
    const normalizedFeature = {
      ...item,
      properties: {
        ...properties,
        ref,
        kind: isPier ? 'pier' : isRoute ? 'route' : isPlace ? 'place' : simpleKind,
        name,
        longName,
        description: localizedDescription(properties, locale),
        subtype,
        layerTarget,
        color: properties.color || inherited.color || '',
        markerMinZoom: legacyZoomToMapLibre(properties.markerVisibleFrom ?? pierDefaults[subtype]?.marker ?? 30),
        labelMinZoom: legacyZoomToMapLibre(properties.labelVisibleFrom ?? pierDefaults[subtype]?.label ?? placeDefaults[subtype]?.from ?? 30),
        labelMaxZoom: legacyZoomToMapLibre(properties.labelVisibleTo ?? placeDefaults[subtype]?.to ?? 30),
        longNameMinZoom: legacyZoomToMapLibre(properties.longNameFrom ?? 9),
        objectMinZoom: legacyZoomToMapLibre(properties.minZ ?? properties.visibleFrom ?? (isRoute ? (subtype === 'cableferry' || subtype === 'conn5' || subtype === 'conn50' ? 9 : 8) : properties.stype === 'road' ? 8 : properties.stype === 'box' || properties.stype === 'pin' ? 11 : 1)),
        objectMaxZoom: legacyZoomToMapLibre(properties.maxZ ?? properties.visibleTo ?? (properties.stype === 'road' ? 8 : properties.stype === 'box' ? 15 : 30)),
        ...placement
      }
    };
    features.push(normalizedFeature);
    if (normalizedFeature.properties.subtype === 'cableferry') {
      features.push(...cableFerryRingFeatures(normalizedFeature));
      features.push(cableFerryHighlightFeature(normalizedFeature));
    }
  }

  collections.forEach(collection => visit(collection));
  const longDistanceLegs = new Map((data.lauttaLegs || []).map(leg => [leg.id, leg]));
  longDistanceLegs.forEach(leg => {
    features.push({
      type: 'Feature',
      properties: { kind: 'longdistance-base', ref: `longdistance-leg-${leg.id}`, name: leg.name, subtype: 'longdistance', color: '' },
      geometry: {
        type: 'LineString',
        coordinates: leg.path.split(' ').map(point => point.split(',').slice(0, 2).map(Number))
      }
    });
  });
  (data.lauttaRoutes || []).forEach(route => {
    (route.legs || []).forEach(legId => {
      const leg = longDistanceLegs.get(legId);
      if (!leg) return;
      features.push({
        type: 'Feature',
        properties: {
          kind: 'route', ref: `longdistance-route-${route.id}`,
          name: localizedName(route, locale), subtype: 'longdistance', color: ''
        },
        geometry: {
          type: 'LineString',
          coordinates: leg.path.split(' ').map(point => point.split(',').slice(0, 2).map(Number))
        }
      });
    });
  });
  return { type: 'FeatureCollection', features };
}

function applyLayerSettings(map, layers = {}) {
  if (!map) return;
  const styleLayers = map.getStyle()?.layers;
  if (!styleLayers) return;
  const groups = {
    roadferries: ['ferry-routes-shadow', 'ferry-routes', 'ferry-routes-hit'],
    conn4: ['connecting-routes-shadow', 'connecting-routes', 'connecting-routes-hit'],
    conn5: ['cruise-routes', 'cruise-routes-hit'],
    longdistanceferries: ['long-distance-routes', 'long-distance-routes-hit'],
    ringroads: ['ring-roads'],
    distances: ['distance-pins']
  };
  const styleLayerIds = styleLayers.map(layer => layer.id);
  styleLayerIds.forEach(id => {
    if (id.startsWith('cable-ferry-')) groups.roadferries.push(id);
    if (id.startsWith('distance-boxes-')) groups.distances.push(id);
  });
  Object.entries(groups).forEach(([setting, ids]) => {
    ids.forEach(id => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', layers[setting] ? 'visible' : 'none');
    });
  });
  const routeLayerIds = styleLayerIds.filter(id =>
    ['ferry-routes-shadow', 'ferry-routes', 'connecting-routes-shadow', 'connecting-routes', 'cruise-routes', 'long-distance-routes'].includes(id) ||
    id.startsWith('cable-ferry-routes-')
  ).filter(id => !id.includes('-hit'));
  let opacityIndex = normalRouteOpacities.get(map);
  if (!opacityIndex) {
    opacityIndex = new Map();
    normalRouteOpacities.set(map, opacityIndex);
  }
  routeLayerIds.forEach(id => {
    if (!map.getLayer(id)) return;
    if (!opacityIndex.has(id)) opacityIndex.set(id, map.getPaintProperty(id, 'line-opacity') ?? 1);
    const opacity = opacityIndex.get(id);
    map.setPaintProperty(id, 'line-opacity', layers.live ? ['*', opacity, 0.2] : opacity);
  });
  styleLayerIds.filter(id => id.startsWith('cable-ferry-rings-')).forEach(id => {
    if (map.getLayer(id)) map.setPaintProperty(id, 'icon-opacity', layers.live ? 0.2 : 1);
  });
}

function MapLibreMap({ data, geojson, dispatch, embedded = false, layers, locale, mapTypeId, infoContent, infoContent2 }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const hoverPopupRef = useRef(null);
  const pierPopupRef = useRef(null);
  const pierPopupIdRef = useRef(null);
  const hasSelectionRef = useRef(false);
  const liveFeaturesRef = useRef([]);
  const sourceDataRef = useRef(null);
  const stopLocationTrackingRef = useRef(() => {});
  const mapTypeRef = useRef(mapTypeId);
  const layersRef = useRef(layers);
  layersRef.current = layers;
  const [status, setStatus] = useState('Ladataan karttaa…');
  const [selection, setSelection] = useState(null);
  const [mapDebug, setMapDebug] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return undefined;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: OPENFREEMAP_STYLE,
      center: [21.25, 60.15],
      zoom: MIN_ROUTE_RENDER_ZOOM,
      minZoom: 4,
      maxZoom: 17,
      attributionControl: false
    });
    mapRef.current = map;
    map.once('load', () => {
      window.requestAnimationFrame(() => {
        map.resize();
        fitRouteArea(map);
      });
    });
    const unregisterMapNavigation = registerMapNavigation(id => {
      const sourceData = sourceDataRef.current;
      if (!sourceData) return false;
      const features = sourceData.features.filter(feature => feature.properties?.ref === id);
      if (!features.length) return false;

      const bounds = new maplibregl.LngLatBounds();
      const extendCoordinates = coordinates => {
        if (!Array.isArray(coordinates)) return;
        if (coordinates.length >= 2 && Number.isFinite(coordinates[0]) && Number.isFinite(coordinates[1])) {
          bounds.extend(coordinates);
          return;
        }
        coordinates.forEach(extendCoordinates);
      };
      features.forEach(feature => extendCoordinates(feature.geometry?.coordinates));
      if (bounds.isEmpty()) return false;

      stopLocationTrackingRef.current();
      const desktop = map.getContainer().clientWidth >= 768;
      map.fitBounds(bounds, {
        padding: desktop
          ? { top: 70, right: 70, bottom: 70, left: 470 }
          : { top: 70, right: 35, bottom: 260, left: 35 },
        maxZoom: legacyZoomToMapLibre(11),
        duration: 500
      });
      return true;
    });
    const unregisterMapView = registerMapView(() => {
      const center = map.getCenter();
      return { lng: center.lng, lat: center.lat, externalZoom: mapLibreZoomToExternal(map.getZoom()) };
    });
    const unregisterMapPierTooltip = registerMapPierTooltip((id, panTo) => {
      const feature = sourceDataRef.current?.features.find(item =>
        item.properties?.kind === 'pier' && item.properties?.ref === id
      );
      if (!feature) return;
      const coordinates = feature.geometry.coordinates;
      pierPopupRef.current?.remove();
      pierPopupIdRef.current = id;
      pierPopupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'pier-info-popup',
        offset: 12
      })
        .setLngLat(coordinates)
        .setText(feature.properties.longName || feature.properties.name || '')
        .addTo(map);
      if (panTo) map.easeTo({ center: coordinates, duration: 400 });
    }, id => {
      if (pierPopupIdRef.current !== id) return;
      pierPopupRef.current?.remove();
      pierPopupRef.current = null;
      pierPopupIdRef.current = null;
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-left');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    let locationMode = 0;
    let positionWatcher = null;
    let latestPosition = null;
    let locationMarker = null;
    const locationButton = document.createElement('button');
    locationButton.type = 'button';
    locationButton.className = 'location-button maplibre-location-button';
    const locationControlContainer = document.createElement('div');
    locationControlContainer.className = 'maplibregl-ctrl maplibre-location-control';
    locationControlContainer.appendChild(locationButton);
    const locationControl = {
      onAdd: () => locationControlContainer,
      onRemove: () => locationControlContainer.remove()
    };

    const ensureLocationLayers = () => {
      if (!map.isStyleLoaded()) return;
      if (!map.getSource('user-location-accuracy')) {
        map.addSource('user-location-accuracy', { type: 'geojson', data: emptyFeatureCollection() });
      }
      if (!map.getLayer('user-location-accuracy-fill')) map.addLayer({
        id: 'user-location-accuracy-fill', type: 'fill', source: 'user-location-accuracy',
        paint: { 'fill-color': '#3B84DF', 'fill-opacity': 0.4 }
      });
      if (!map.getLayer('user-location-accuracy-line')) map.addLayer({
        id: 'user-location-accuracy-line', type: 'line', source: 'user-location-accuracy',
        paint: { 'line-color': '#3B84DF', 'line-opacity': 0.8, 'line-width': 1 }
      });
    };

    const clearLocationDisplay = () => {
      locationMarker?.remove();
      locationMarker = null;
      map.getSource('user-location-accuracy')?.setData(emptyFeatureCollection());
    };

    const showLatestPosition = () => {
      if (!latestPosition || locationMode === 0 || document.hidden) return;
      const { lng, lat, accuracy } = latestPosition;
      ensureLocationLayers();
      if (accuracy < 100) {
        map.getSource('user-location-accuracy')?.setData(emptyFeatureCollection());
        if (!locationMarker) {
          const markerElement = document.createElement('div');
          markerElement.className = 'maplibre-user-location-marker';
          markerElement.innerHTML = '<span></span>';
          locationMarker = new maplibregl.Marker({ element: markerElement }).setLngLat([lng, lat]).addTo(map);
        } else {
          locationMarker.setLngLat([lng, lat]);
        }
      } else {
        locationMarker?.remove();
        locationMarker = null;
        map.getSource('user-location-accuracy')?.setData({
          type: 'FeatureCollection',
          features: [accuracyCircleFeature(lng, lat, accuracy)]
        });
      }
    };

    const panToLatestPosition = () => {
      if (latestPosition?.accuracy <= 100) {
        map.easeTo({ center: [latestPosition.lng, latestPosition.lat], duration: 500 });
      }
    };

    const stopPositionWatcher = () => {
      if (positionWatcher !== null) navigator.geolocation.clearWatch(positionWatcher);
      positionWatcher = null;
    };

    const updateLocationButton = () => {
      locationButton.classList.toggle('active', locationMode > 0);
      locationButton.classList.toggle('follow', locationMode === 2);
      locationButton.setAttribute('aria-label', locationMode === 0
        ? 'Näytä oma sijainti'
        : locationMode === 1 ? 'Seuraa omaa sijaintia' : 'Poista paikannus käytöstä');
    };

    function setLocationMode(nextMode) {
      locationMode = nextMode;
      updateLocationButton();
      if (locationMode === 0) {
        stopPositionWatcher();
        latestPosition = null;
        clearLocationDisplay();
      } else {
        startPositionWatcher();
        showLatestPosition();
        if (locationMode === 2) panToLatestPosition();
      }
    }

    const onPositionError = error => {
      setLocationMode(0);
      console.error('Location error', error);
      window.alert(error.message);
    };

    function startPositionWatcher() {
      stopPositionWatcher();
      if (locationMode === 0 || document.hidden) return;
      positionWatcher = navigator.geolocation.watchPosition(position => {
        const firstPosition = latestPosition === null;
        latestPosition = {
          lng: position.coords.longitude,
          lat: position.coords.latitude,
          accuracy: position.coords.accuracy
        };
        showLatestPosition();
        if (firstPosition || locationMode === 2) panToLatestPosition();
      }, onPositionError, { timeout: 10000, enableHighAccuracy: true });
    }

    const stopLocationTracking = () => {
      if (locationMode === 2) setLocationMode(1);
    };
    stopLocationTrackingRef.current = stopLocationTracking;
    const onLocationButtonClick = () => setLocationMode((locationMode + 1) % 3);
    const onLocationVisibilityChange = () => {
      if (document.hidden) {
        stopPositionWatcher();
        clearLocationDisplay();
      } else if (locationMode > 0) {
        startPositionWatcher();
        showLatestPosition();
      }
    };
    if (navigator.geolocation) {
      updateLocationButton();
      locationButton.addEventListener('click', onLocationButtonClick);
      map.addControl(locationControl, 'bottom-right');
      map.on('dragstart', stopLocationTracking);
      document.addEventListener('visibilitychange', onLocationVisibilityChange);
    }
    const collapseAttribution = () => {
      const attribution = map.getContainer().querySelector('.maplibregl-ctrl-attrib.maplibregl-compact-show');
      if (!attribution) return;
      attribution.querySelector('.maplibregl-ctrl-attrib-button')?.click();
      map.off('styledata', collapseAttribution);
    };
    map.on('styledata', collapseAttribution);
    const updateMapDebug = () => {
      if (!SHOW_MAP_DEBUG) return;
      const bounds = map.getBounds();
      setMapDebug({
        west: bounds.getWest(), south: bounds.getSouth(),
        east: bounds.getEast(), north: bounds.getNorth(), zoom: map.getZoom()
      });
    };
    const updateResetVisibility = () => {
      const bounds = map.getBounds();
      const intersectsArchipelago = bounds.getEast() >= ARCHIPELAGO_BOUNDS.west &&
        bounds.getWest() <= ARCHIPELAGO_BOUNDS.east &&
        bounds.getNorth() >= ARCHIPELAGO_BOUNDS.south &&
        bounds.getSouth() <= ARCHIPELAGO_BOUNDS.north;
      setShowReset(!intersectsArchipelago);
    };
    const onMoveEnd = () => {
      updateMapDebug();
      updateResetVisibility();
    };
    map.on('moveend', onMoveEnd);
    let resizeFrame;
    const resizeMap = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = undefined;
        map.resize();
        updateMapDebug();
      });
    };
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resizeMap) : null;
    resizeObserver?.observe(mapContainer.current);
    const resizeWhenVisible = () => {
      if (!document.hidden) resizeMap();
    };
    window.addEventListener('resize', resizeMap);
    window.addEventListener('pageshow', resizeMap);
    document.addEventListener('visibilitychange', resizeWhenVisible);
    window.screen?.orientation?.addEventListener?.('change', resizeMap);
    let startupTimer;
    let introductionTimer;
    let revealFrame;
    let revealMap;
    let bannerElement;
    let onBannerHidden;
    const startIntroduction = () => {
      dispatch({ type: 'PHASE_CHANGED', payload: phases.INTRODUCTION });
      introductionTimer = window.setTimeout(() => {
        dispatch({ type: 'PHASE_CHANGED', payload: phases.NORMAL_USE });
      }, 12000);
    };
    const finishStartup = () => {
      dispatch({ type: 'PHASE_CHANGED', payload: phases.LOADER_CLOSED });
      const jquery = window.$;
      const currentBannerVersion = Number(jquery?.('#dont-show-again-cb').attr('version')) || 0;
      const hiddenBannerVersion = Number(window.localStorage.getItem('dontShowAgainVersion')) || 0;
      const shouldShowBanner = currentBannerVersion > hiddenBannerVersion &&
        !window.location.hash && !hasSelectionRef.current;
      bannerElement = jquery?.('#bannerModal');
      if (shouldShowBanner && bannerElement?.modal) {
        onBannerHidden = () => {
          bannerElement.off('hidden.bs.modal', onBannerHidden);
          if (jquery('#dont-show-again-cb').is(':checked')) {
            window.localStorage.setItem('dontShowAgainVersion', currentBannerVersion);
          }
          startIntroduction();
        };
        bannerElement.on('hidden.bs.modal', onBannerHidden);
        bannerElement.modal({});
        dispatch({ type: 'PHASE_CHANGED', payload: phases.BANNER_OPEN });
      } else {
        startupTimer = window.setTimeout(startIntroduction, 500);
      }
    };
    map.on('load', () => {
      customizeBaseMap(map);
      addRasterBaseMaps(map);
      setBaseMap(map, mapTypeRef.current);
      addArchipelagoTarget(map);
      collapseAttribution();
      updateMapDebug();
      updateResetVisibility();
      ensureLocationLayers();
      showLatestPosition();
      setStatus('Kartta valmis');
      revealMap = () => {
        revealFrame = window.requestAnimationFrame(() => {
          setMapReady(true);
          if (embedded) finishStartup();
        });
      };
      map.once('idle', revealMap);
      map.triggerRepaint();
    });
    map.on('error', event => {
      console.error('MapLibre error', event.error);
      setStatus('Karttapohjan lataus epäonnistui');
    });
    return () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resizeMap);
      window.removeEventListener('pageshow', resizeMap);
      document.removeEventListener('visibilitychange', resizeWhenVisible);
      window.screen?.orientation?.removeEventListener?.('change', resizeMap);
      window.clearTimeout(startupTimer);
      window.clearTimeout(introductionTimer);
      if (revealFrame) window.cancelAnimationFrame(revealFrame);
      if (revealMap) map.off('idle', revealMap);
      if (bannerElement && onBannerHidden) bannerElement.off('hidden.bs.modal', onBannerHidden);
      map.off('moveend', onMoveEnd);
      map.off('dragstart', stopLocationTracking);
      locationButton.removeEventListener('click', onLocationButtonClick);
      document.removeEventListener('visibilitychange', onLocationVisibilityChange);
      stopPositionWatcher();
      clearLocationDisplay();
      pierPopupRef.current?.remove();
      pierPopupRef.current = null;
      pierPopupIdRef.current = null;
      if (navigator.geolocation && locationControlContainer.parentNode) map.removeControl(locationControl);
      stopLocationTrackingRef.current = () => {};
      unregisterMapNavigation();
      unregisterMapPierTooltip();
      unregisterMapView();
      map.remove();
      mapRef.current = null;
    };
  }, [dispatch, embedded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data?.piers || !geojson?.length) return undefined;
    const sourceData = flattenMapData(geojson, data, locale);
    sourceDataRef.current = sourceData;
    mapDataReady();

    function addLayers() {
      if (map.getSource('saaristolautat')) {
        map.getSource('saaristolautat').setData(sourceData);
        applyLayerSettings(map, layersRef.current);
        raiseLiveLayers(map);
        return;
      }
      map.addSource('saaristolautat', { type: 'geojson', data: sourceData, generateId: true });
      addCableFerryRingImage(map);
      addDirectionalPinImages(map);
      addDistanceSignImage(map);

      const roadRanges = [...new Set(sourceData.features.filter(feature => feature.properties.kind === 'road')
        .map(feature => `${feature.properties.objectMinZoom}-${feature.properties.objectMaxZoom}`))];
      roadRanges.forEach(range => {
        const [minZoom, maxZoom] = range.split('-').map(Number);
        map.addLayer({
          id: `custom-roads-${range}`, type: 'line', source: 'saaristolautat',
          filter: ['all', ['==', ['get', 'kind'], 'road'], ['==', ['get', 'objectMinZoom'], minZoom], ['==', ['get', 'objectMaxZoom'], maxZoom]],
          minzoom: minZoom, maxzoom: maxZoom + 1,
          paint: { 'line-color': '#8a7d6a', 'line-width': 1, 'line-opacity': 1 }
        });
      });
      map.addLayer({
        id: 'ring-roads', type: 'line', source: 'saaristolautat',
        filter: ['==', ['get', 'kind'], 'ringroad'], minzoom: 7,
        paint: { 'line-color': '#202020', 'line-opacity': 0.4, 'line-width': ['step', ['zoom'], 2, 8, 2.5, 9, 3] }
      });
      map.addLayer({
        id: 'archipelago-border', type: 'line', source: 'saaristolautat',
        filter: ['==', ['get', 'kind'], 'border'], minzoom: 6,
        paint: { 'line-color': '#808080', 'line-opacity': 0.4, 'line-width': 1, 'line-dasharray': [4, 4] }
      });

      const routeColor = ['case',
        ['!=', ['get', 'color'], ''], ['get', 'color'],
        ['==', ['get', 'subtype'], 'cableferry'], '#009b72',
        ['==', ['get', 'subtype'], 'longdistance'], '#7065d8',
        ['==', ['get', 'subtype'], 'conn2'], '#005dd8',
        ['==', ['get', 'subtype'], 'conn2m'], '#ff7c0a',
        ['==', ['get', 'subtype'], 'conn4'], '#7fb3e8',
        '#f08000'
      ];
      const routeWidth = ['match', ['get', 'subtype'],
        'conn1b', 3,
        'conn2', 3.75,
        'conn2m', 3,
        'conn2b', 2.25,
        'conn3', 3,
        'conn4', 2.25,
        'longdistance', 1.5,
        5.25
      ];
      const routeOpacity = ['case',
        ['has', 'opacity'], ['get', 'opacity'],
        ['==', ['get', 'subtype'], 'conn3'], 1,
        ['==', ['get', 'subtype'], 'conn4'], 0.8,
        0.7
      ];
      const solidRouteFilter = ['all', ['==', ['get', 'kind'], 'route'], ['!', ['in', ['get', 'subtype'], ['literal', ['conn5', 'conn50', 'cableferry', 'longdistance']]]]];
      const roadFerryRouteFilter = ['all', solidRouteFilter, ['==', ['get', 'layerTarget'], 'roadferries']];
      const connectingRouteFilter = ['all', solidRouteFilter, ['==', ['get', 'layerTarget'], 'conn4']];
      const cableFerryMinZooms = [...new Set(sourceData.features
        .filter(feature => feature.properties.kind === 'route' && feature.properties.subtype === 'cableferry')
        .map(feature => feature.properties.objectMinZoom))].sort((a, b) => a - b);

      map.addLayer({
        id: 'ferry-routes-shadow', type: 'line', source: 'saaristolautat',
        filter: roadFerryRouteFilter, minzoom: 7,
        paint: { 'line-color': '#ffffff', 'line-width': ['+', routeWidth, 2], 'line-opacity': 0.85 }
      });
      map.addLayer({
        id: 'ferry-routes', type: 'line', source: 'saaristolautat',
        filter: roadFerryRouteFilter, minzoom: 7,
        paint: { 'line-color': routeColor, 'line-width': routeWidth, 'line-opacity': routeOpacity }
      });
      map.addLayer({
        id: 'connecting-routes-shadow', type: 'line', source: 'saaristolautat',
        filter: connectingRouteFilter, minzoom: 7,
        paint: { 'line-color': '#ffffff', 'line-width': ['+', routeWidth, 2], 'line-opacity': 0.85 }
      });
      map.addLayer({
        id: 'connecting-routes', type: 'line', source: 'saaristolautat',
        filter: connectingRouteFilter, minzoom: 7,
        paint: { 'line-color': routeColor, 'line-width': routeWidth, 'line-opacity': routeOpacity }
      });

      map.addLayer({
        id: 'cruise-routes', type: 'line', source: 'saaristolautat',
        filter: ['all', ['==', ['get', 'kind'], 'route'], ['in', ['get', 'subtype'], ['literal', ['conn5', 'conn50']]]],
        minzoom: 8,
        paint: { 'line-color': '#ff7c0a', 'line-width': 2, 'line-opacity': 0.7, 'line-dasharray': [2, 2] }
      });
      cableFerryMinZooms.forEach(minZoom => map.addLayer({
        id: `cable-ferry-routes-${String(minZoom).replace('.', '-')}`, type: 'line', source: 'saaristolautat',
        filter: ['all', ['==', ['get', 'kind'], 'route'], ['==', ['get', 'subtype'], 'cableferry'], ['==', ['get', 'objectMinZoom'], minZoom]],
        minzoom: minZoom,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#009b63',
          'line-width': ['interpolate', ['linear'], ['zoom'], 6.5, 1, 10, 1.5, 14, 2],
          'line-opacity': 0.32
        }
      }));
      [...new Set(sourceData.features.filter(feature => feature.properties.kind === 'cable-ferry-ring')
        .map(feature => feature.properties.minZoom))].sort((a, b) => a - b).forEach(minZoom => map.addLayer({
        id: `cable-ferry-rings-${String(minZoom).replace('.', '-')}`,
        type: 'symbol', source: 'saaristolautat',
        filter: ['all', ['==', ['get', 'kind'], 'cable-ferry-ring'], ['==', ['get', 'minZoom'], minZoom]],
        minzoom: minZoom,
        layout: {
          'icon-image': 'cable-ferry-ring',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 1.15, 12, 1.35],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      }));

      map.addLayer({
        id: 'long-distance-routes', type: 'line', source: 'saaristolautat',
        filter: ['==', ['get', 'kind'], 'longdistance-base'],
        minzoom: 6, maxzoom: 11,
        paint: { 'line-color': '#e08080', 'line-width': 1.5, 'line-opacity': 0.4, 'line-dasharray': [1, 1] }
      });

      map.addLayer({
        id: 'route-selected-highlight', type: 'line', source: 'saaristolautat',
        filter: ['all', ['==', ['get', 'kind'], 'route'], ['==', ['get', 'ref'], '__no-route__']],
        paint: { 'line-color': '#f97cdc', 'line-width': ['+', routeWidth, 8], 'line-opacity': 0.7 }
      });
      map.addLayer({
        id: 'route-hover-highlight', type: 'line', source: 'saaristolautat',
        filter: ['all', ['==', ['get', 'kind'], 'route'], ['==', ['get', 'ref'], '__no-route__']],
        paint: { 'line-color': '#f97cdc', 'line-width': ['+', routeWidth, 8], 'line-opacity': 0.7 }
      });
      map.addLayer({
        id: 'cable-ferry-selected-highlight', type: 'circle', source: 'saaristolautat',
        filter: ['all', ['==', ['get', 'kind'], 'cable-ferry-highlight'], ['==', ['get', 'ref'], '__no-route__']],
        paint: { 'circle-radius': 13, 'circle-color': '#f97cdc', 'circle-opacity': 0.25, 'circle-stroke-color': '#f97cdc', 'circle-stroke-width': 4, 'circle-stroke-opacity': 0.8 }
      });
      map.addLayer({
        id: 'cable-ferry-hover-highlight', type: 'circle', source: 'saaristolautat',
        filter: ['all', ['==', ['get', 'kind'], 'cable-ferry-highlight'], ['==', ['get', 'ref'], '__no-route__']],
        paint: { 'circle-radius': 11, 'circle-color': '#f97cdc', 'circle-opacity': 0.2, 'circle-stroke-color': '#f97cdc', 'circle-stroke-width': 3, 'circle-stroke-opacity': 0.75 }
      });

      const routeHitLayers = [
        { id: 'ferry-routes-hit', filter: roadFerryRouteFilter, minzoom: 7 },
        { id: 'connecting-routes-hit', filter: connectingRouteFilter, minzoom: 7 },
        { id: 'cruise-routes-hit', filter: ['all', ['==', ['get', 'kind'], 'route'], ['in', ['get', 'subtype'], ['literal', ['conn5', 'conn50']]]], minzoom: 8 },
        ...cableFerryMinZooms.map(minZoom => ({
          id: `cable-ferry-routes-hit-${String(minZoom).replace('.', '-')}`,
          filter: ['all', ['==', ['get', 'kind'], 'route'], ['==', ['get', 'subtype'], 'cableferry'], ['==', ['get', 'objectMinZoom'], minZoom]],
          minzoom: minZoom
        })),
        { id: 'long-distance-routes-hit', filter: ['all', ['==', ['get', 'kind'], 'route'], ['==', ['get', 'subtype'], 'longdistance']], minzoom: 6, maxzoom: 11 }
      ];
      routeHitLayers.forEach(hitLayer => map.addLayer({
        ...hitLayer,
        type: 'line',
        source: 'saaristolautat',
        paint: { 'line-color': '#000000', 'line-width': 18, 'line-opacity': 0.001 }
      }));

      map.addLayer({
        id: 'distance-pins', type: 'symbol', source: 'saaristolautat',
        filter: ['==', ['get', 'kind'], 'pin'], minzoom: 10,
        layout: { 'icon-image': ['concat', 'direction-pin-', ['get', 'subtype']], 'icon-size': 1.8, 'icon-allow-overlap': true }
      });
      const boxRanges = [...new Set(sourceData.features.filter(feature => feature.properties.kind === 'box')
        .map(feature => `${feature.properties.objectMinZoom}-${feature.properties.objectMaxZoom}`))];
      boxRanges.forEach(range => {
        const [from, to] = range.split('-').map(Number);
        map.addLayer({
          id: `distance-boxes-${range}`, type: 'symbol', source: 'saaristolautat', minzoom: from, maxzoom: to + 1,
          filter: ['all', ['==', ['get', 'kind'], 'box'], ['==', ['get', 'objectMinZoom'], from], ['==', ['get', 'objectMaxZoom'], to]],
          layout: {
            'text-field': ['get', 'description'], 'text-font': ['Noto Sans Bold'], 'text-size': legacyEmSize(0.9),
            'text-line-height': 1.1, 'text-max-width': 100,
            'text-offset': ['array', 'number', 2, ['get', 'labelOffset']], 'text-anchor': ['get', 'labelTextAnchor'], 'text-optional': true,
            'text-allow-overlap': true, 'text-ignore-placement': true,
            'icon-image': 'distance-sign', 'icon-text-fit': 'both', 'icon-text-fit-padding': [4, 6, 4, 6],
            'icon-allow-overlap': true, 'icon-ignore-placement': true
          },
          paint: { 'text-color': '#ffffff' }
        });
      });

      const pierStyles = [
        { type: '1', radius: ['step', ['zoom'], 3, 8, 4, 10, 5, 11, 6], opacity: ['step', ['zoom'], 1, 10, 0.8], em: 1.2, font: 'Noto Sans Bold' },
        { type: '2', radius: ['step', ['zoom'], 3, 9, 3.5, 10, 4, 12, 5], opacity: ['step', ['zoom'], 0.5, 11, 0.8], em: 1.1, font: 'Noto Sans Bold' },
        { type: '3', radius: ['step', ['zoom'], 2.5, 9, 3, 10, 3.5, 12, 4.5], opacity: ['step', ['zoom'], 0.5, 12, 0.8], em: 1.1, font: 'Noto Sans Regular' },
        { type: '4', radius: ['step', ['zoom'], 1, 9, 2, 10, 3, 11, 4], opacity: ['step', ['zoom'], 0.5, 12, 0.8], em: 1, font: 'Noto Sans Regular' },
        { type: '5', radius: 0, opacity: 0, em: 1, font: 'Noto Sans Regular' }
      ];
      pierStyles.forEach(pierStyle => {
        const items = sourceData.features.filter(feature => feature.properties.kind === 'pier' && feature.properties.subtype === pierStyle.type);
        [...new Set(items.map(feature => feature.properties.markerMinZoom))].filter(zoom => zoom < 24).forEach(zoom => {
          const id = `piers-${pierStyle.type}-${zoom}`;
          map.addLayer({ id, type: 'circle', source: 'saaristolautat', minzoom: zoom,
            filter: ['all', ['==', ['get', 'kind'], 'pier'], ['==', ['get', 'subtype'], pierStyle.type], ['==', ['get', 'markerMinZoom'], zoom]],
            paint: { 'circle-radius': pierStyle.radius, 'circle-color': '#e00000', 'circle-opacity': pierStyle.opacity }
          });
        });
        [...new Set(items.map(feature => feature.properties.labelMinZoom))].filter(zoom => zoom < 24).forEach(zoom => map.addLayer({
          id: `pier-labels-${pierStyle.type}-${zoom}`, type: 'symbol', source: 'saaristolautat', minzoom: zoom,
          filter: ['all', ['==', ['get', 'kind'], 'pier'], ['==', ['get', 'subtype'], pierStyle.type], ['==', ['get', 'labelMinZoom'], zoom]],
          layout: {
            'text-field': ['get', 'longName'], 'text-font': [pierStyle.font], 'text-size': legacyEmSize(pierStyle.em),
            'text-offset': ['array', 'number', 2, ['get', 'labelOffset']],
            'text-anchor': ['get', 'labelTextAnchor'], 'text-optional': true,
            'text-justify': 'left',
            'text-allow-overlap': true, 'text-ignore-placement': true
          },
          paint: { 'text-color': '#002080', 'text-opacity': 0.9, 'text-halo-color': 'rgba(255,255,255,0.95)', 'text-halo-width': 1.8, 'text-halo-blur': 0.2 }
        }));
      });

      [
        { type: 'province', em: 2, font: 'Noto Sans Bold', color: '#202030', opacity: 0.6 },
        { type: 'mun1', em: 1.8, font: 'Noto Sans Bold', color: '#202030', opacity: 0.6 },
        { type: 'mun2', em: 1.4, font: 'Noto Sans Bold', color: '#202030', opacity: 0.6 },
        { type: 'island1', em: 1, font: 'Noto Sans Regular', color: '#101010', opacity: 0.8 }
      ].forEach(placeStyle => {
        const ranges = [...new Set(sourceData.features.filter(feature => feature.properties.kind === 'place' && feature.properties.subtype === placeStyle.type)
          .map(feature => `${feature.properties.labelMinZoom},${feature.properties.labelMaxZoom},${feature.properties.longNameMinZoom}`))];
        ranges.forEach(range => {
          const [from, to, longNameFrom] = range.split(',').map(Number);
          if (to < from) return;
          map.addLayer({ id: `place-labels-${placeStyle.type}-${range.replaceAll(',', '-')}`, type: 'symbol', source: 'saaristolautat', minzoom: from, ...(to < legacyZoomToMapLibre(30) ? { maxzoom: to + 1 } : {}),
            filter: ['all', ['==', ['get', 'kind'], 'place'], ['==', ['get', 'subtype'], placeStyle.type], ['==', ['get', 'labelMinZoom'], from], ['==', ['get', 'labelMaxZoom'], to], ['==', ['get', 'longNameMinZoom'], longNameFrom]],
            layout: { 'text-field': ['step', ['zoom'], ['get', 'name'], longNameFrom, ['get', 'longName']], 'text-font': [placeStyle.font], 'text-size': legacyEmSize(placeStyle.em),
              'text-offset': ['array', 'number', 2, ['get', 'labelOffset']], 'text-anchor': ['get', 'labelTextAnchor'], 'text-optional': true,
              'text-justify': 'left',
              'text-allow-overlap': true, 'text-ignore-placement': true },
            paint: { 'text-color': placeStyle.color, 'text-opacity': placeStyle.opacity, 'text-halo-color': 'rgba(255,255,255,0.95)', 'text-halo-width': 1.8, 'text-halo-blur': 0.2 }
          });
        });
      });
      const routeLayers = routeHitLayers.map(layer => layer.id);

      routeLayers.forEach(layer => {
        map.on('mouseenter', layer, event => {
          const allHoveredFeatures = map.queryRenderedFeatures(event.point, { layers: routeLayers });
          const feature = allHoveredFeatures[0];
          if (!feature) return;
          const hoveredFeatures = feature.properties.subtype === 'longdistance'
            ? allHoveredFeatures.filter(item => item.properties.subtype === 'longdistance')
            : [feature];
          const refs = [...new Set(hoveredFeatures.map(item => item.properties.ref))];
          const names = [...new Set(hoveredFeatures.map(item => item.properties.name).filter(Boolean))];
          map.getCanvas().style.cursor = 'pointer';
          map.setFilter('route-hover-highlight', ['all', ['==', ['get', 'kind'], 'route'], ['in', ['get', 'ref'], ['literal', refs]]]);
          map.setFilter('cable-ferry-hover-highlight', ['all', ['==', ['get', 'kind'], 'cable-ferry-highlight'], ['in', ['get', 'ref'], ['literal', refs]]]);
          hoverPopupRef.current?.remove();
          hoverPopupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'route-hover-popup', offset: 14 })
            .setLngLat(event.lngLat)
            .setHTML(names.map(name => `<strong>${name}</strong>`).join('<br>'))
            .addTo(map);
        });
        map.on('mousemove', layer, event => hoverPopupRef.current?.setLngLat(event.lngLat));
        map.on('mouseleave', layer, () => clearRouteHover(map, hoverPopupRef));
      });

      map.on('click', event => {
        const allClickedFeatures = map.queryRenderedFeatures(event.point, { layers: routeLayers });
        const feature = allClickedFeatures[0];
        if (feature) {
          const clickedFeatures = feature.properties.subtype === 'longdistance'
            ? allClickedFeatures.filter(item => item.properties.subtype === 'longdistance')
            : [feature];
          const refs = [...new Set(clickedFeatures.map(item => item.properties.ref))];
          const names = [...new Set(clickedFeatures.map(item => item.properties.name).filter(Boolean))];
          hideMenuAndSettings();
          clearRouteHover(map, hoverPopupRef);
          map.setFilter('route-selected-highlight', ['all', ['==', ['get', 'kind'], 'route'], ['in', ['get', 'ref'], ['literal', refs]]]);
          map.setFilter('cable-ferry-selected-highlight', ['all', ['==', ['get', 'kind'], 'cable-ferry-highlight'], ['in', ['get', 'ref'], ['literal', refs]]]);
          setSelection({ name: names.join(' / ') });
          if (feature.properties.subtype === 'longdistance') {
            const routeIds = refs.map(ref => Number(ref.replace('longdistance-route-', ''))).filter(Number.isFinite);
            const targets = routeIds.map(id => data.lauttaRoutes?.find(route => route.id === id)).filter(Boolean).map(route => {
              const operator = data.lauttaOperators?.[route.operators?.[0]];
              return {
                id: route.id,
                name: localizedName(route, locale),
                details: localizedDescription(route, locale),
                operator,
                style: { color: '#e08080', weight: 1.5, style: 'dotted', opacity: 0.7 }
              };
            }).filter(target => target.operator);
            window.history.pushState({ route: routeIds, timetable: null }, null, null);
            dispatch({ type: 'INFOCONTENT2_SELECTED', payload: targets });
          } else if (refs.length === 1) {
            window.history.pushState({ route: refs[0], timetable: null }, null, null);
            dispatch({ type: 'INFOCONTENT_SELECTED', payload: refs[0] });
          }
          const container = map.getContainer();
          if (container.clientWidth >= 768) {
            const panelEdge = 450;
            if (event.point.x < panelEdge) {
              stopLocationTrackingRef.current();
              const targetX = 400 + (container.clientWidth - 400) / 3;
              map.panBy([event.point.x - targetX, 0], { duration: 350 });
            }
          } else if (event.point.y > container.clientHeight * 0.8) {
            stopLocationTrackingRef.current();
            map.panBy([0, container.clientHeight * 0.2], { duration: 350 });
          }
          return;
        }
        if (hideMenuAndSettings()) return;
        if (!hasSelectionRef.current) return;
        window.history.pushState({ route: null, timetable: null }, null, null);
        dispatch({ type: 'INFOCONTENT_UNSELECTED', payload: null });
      });

      const routeCount = sourceData.features.filter(feature => feature.properties.kind === 'route').length;
      const pierCount = sourceData.features.filter(feature => feature.properties.kind === 'pier').length;
      const placeCount = sourceData.features.filter(feature => feature.properties.kind === 'place').length;
      setStatus(`${routeCount} reittiosuutta · ${pierCount} laituria · ${placeCount} paikannimeä`);
      applyLayerSettings(map, layersRef.current);
      raiseLiveLayers(map);
    }

    if (map.loaded()) addLayers();
    else map.once('load', addLayers);
    return undefined;
  }, [data, dispatch, geojson, locale]);

  useEffect(() => {
    applyLayerSettings(mapRef.current, layers);
  }, [layers]);

  useEffect(() => {
    mapTypeRef.current = mapTypeId;
    const map = mapRef.current;
    if (map) setBaseMap(map, mapTypeId);
  }, [mapTypeId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    let interval;
    let dimmingTimeout;
    let cancelled = false;

    const ensureLiveLayers = () => {
      if (!map.getStyle()?.layers?.length) return false;
      addLiveVesselImages(map);
      if (!map.getSource('live-history')) map.addSource('live-history', { type: 'geojson', data: emptyFeatureCollection() });
      if (!map.getSource('live-vessels')) map.addSource('live-vessels', { type: 'geojson', data: emptyFeatureCollection() });
      if (!map.getLayer('live-history')) map.addLayer({
        id: 'live-history', type: 'line', source: 'live-history', minzoom: legacyZoomToMapLibre(8),
        paint: { 'line-color': '#a0a0a0', 'line-width': 0.5, 'line-opacity': 0.7 }
      });
      if (!map.getLayer('live-vessels')) map.addLayer({
        id: 'live-vessels', type: 'symbol', source: 'live-vessels', minzoom: legacyZoomToMapLibre(8),
        layout: {
          'icon-image': ['case', ['>', ['get', 'sog'], 0.1], 'live-vessel-moving', 'live-vessel-stopped'],
          'icon-size': ['interpolate', ['linear'], ['zoom'],
            7, ['case', ['>', ['get', 'sog'], 0.1], 0.8, 0.65],
            12, ['case', ['>', ['get', 'sog'], 0.1], 1.3, 0.9]
          ],
          'icon-rotate': ['case', ['>', ['get', 'sog'], 0.1], ['get', 'cog'], 0],
          'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true
        },
        paint: { 'icon-opacity': ['get', 'opacity'] }
      });
      if (!map.getLayer('live-vessel-labels')) map.addLayer({
        id: 'live-vessel-labels', type: 'symbol', source: 'live-vessels', minzoom: legacyZoomToMapLibre(9),
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['case', ['>', ['get', 'sog'], 0.1], 12, 9],
          'text-offset': ['case', ['>', ['get', 'sog'], 0.1], ['literal', [-0.35, -0.35]], ['literal', [-0.2, -0.2]]],
          'text-anchor': 'bottom-right',
          'text-allow-overlap': true, 'text-ignore-placement': true
        },
        paint: { 'text-color': '#880078', 'text-halo-color': 'rgba(255,255,255,0.9)', 'text-halo-width': 1 }
      });
      raiseLiveLayers(map);
      return true;
    };

    const clearLiveData = () => {
      map.getSource('live-vessels')?.setData(emptyFeatureCollection());
      map.getSource('live-history')?.setData(emptyFeatureCollection());
      liveFeaturesRef.current = [];
      dispatch({ type: 'UPDATE_INDICATOR_MSG', payload: '' });
    };

    const loadLiveData = async () => {
      try {
        const [vesselsResponse, historyResponse] = await Promise.all([
          fetch('https://live.saaristolautat.fi/livedata.json'),
          fetch('https://live.saaristolautat.fi/livehistory.json')
        ]);
        if (!vesselsResponse.ok || !historyResponse.ok) throw new Error('Live data request failed');
        const [vessels, history] = await Promise.all([vesselsResponse.json(), historyResponse.json()]);
        if (cancelled || !ensureLiveLayers()) return;
        const now = Date.now();
        const features = (vessels.features || []).map(feature => {
          const age = Math.max(0, now - Number(feature.properties?.timestampExternal || 0)) / 1000;
          return {
            ...feature,
            properties: {
              ...feature.properties,
              name: feature.properties?.vessel?.name || '', age,
              opacity: Math.max(0.3, 1 - 0.7 * Math.max(0, age - 180) / 600)
            }
          };
        }).filter(feature => feature.properties.age < 600);
        liveFeaturesRef.current = features;
        map.getSource('live-vessels').setData({ type: 'FeatureCollection', features });
        map.getSource('live-history').setData(history);
        updateLiveIndicator(map, features, dispatch);
      } catch (error) {
        if (!cancelled) {
          console.error('Live data error', error);
          dispatch({ type: 'UPDATE_INDICATOR_MSG', payload: ['live.notavailable'] });
        }
      }
    };

    const onMoveEnd = () => updateLiveIndicator(map, liveFeaturesRef.current, dispatch);
    const start = () => {
      ensureLiveLayers();
      if (!layers.live) {
        clearLiveData();
        return;
      }
      dispatch({ type: 'UPDATE_INDICATOR_MSG', payload: 'live.loading' });
      const applyDimming = () => {
        if (!cancelled) applyLayerSettings(map, { ...layers, live: true });
      };
      applyDimming();
      dimmingTimeout = window.setTimeout(applyDimming, 0);
      map.once('idle', applyDimming);
      loadLiveData();
      interval = window.setInterval(loadLiveData, 10000);
      map.on('moveend', onMoveEnd);
    };
    if (map.getSource('saaristolautat') || map.isStyleLoaded()) start();
    else map.once('load', start);

    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
      if (dimmingTimeout) window.clearTimeout(dimmingTimeout);
      map.off('load', start);
      map.off('moveend', onMoveEnd);
    };
  }, [dispatch, layers.live]);

  useEffect(() => {
    const map = mapRef.current;
    hasSelectionRef.current = Boolean(infoContent || infoContent2);
    if (!map?.getLayer('route-selected-highlight')) return;
    const refs = infoContent
      ? [infoContent]
      : (infoContent2 || []).map(route => `longdistance-route-${route.id}`);
    if (refs.length) clearRouteHover(map, hoverPopupRef);
    map.setFilter('route-selected-highlight', refs.length
      ? ['all', ['==', ['get', 'kind'], 'route'], ['in', ['get', 'ref'], ['literal', refs]]]
      : ['all', ['==', ['get', 'kind'], 'route'], ['==', ['get', 'ref'], '__no-route__']]);
    map.setFilter('cable-ferry-selected-highlight', refs.length
      ? ['all', ['==', ['get', 'kind'], 'cable-ferry-highlight'], ['in', ['get', 'ref'], ['literal', refs]]]
      : ['all', ['==', ['get', 'kind'], 'cable-ferry-highlight'], ['==', ['get', 'ref'], '__no-route__']]);
    if (!refs.length) {
      setSelection(null);
    }
  }, [infoContent, infoContent2]);

  const debugElement = SHOW_MAP_DEBUG && mapDebug && (
    <output className="map-debug" aria-label="Kartan rajat ja zoom-taso">
      W {mapDebug.west.toFixed(5)} · S {mapDebug.south.toFixed(5)} · E {mapDebug.east.toFixed(5)} · N {mapDebug.north.toFixed(5)} · z {mapDebug.zoom.toFixed(2)}
    </output>
  );

  const resetButton = showReset && (
    <button
      type="button"
      className="reset-button map-reset-button"
      aria-label="Palauta kartta Saaristomerelle"
      title="Palauta kartta Saaristomerelle"
      onClick={() => {
        stopLocationTrackingRef.current();
        if (mapRef.current) fitRouteArea(mapRef.current, { padding: 35, duration: 600 });
      }}
    />
  );

  if (embedded) return (
    <>
      <div ref={mapContainer} id="map" className={`map maplibre-embedded ${mapReady ? 'maplibre-map-ready' : 'maplibre-map-loading'}`} aria-label="Saaristolauttojen kartta" />
      {resetButton}
      {debugElement}
    </>
  );

  return (
    <main className="map-view">
      <div ref={mapContainer} className={`map-view__canvas ${mapReady ? 'maplibre-map-ready' : 'maplibre-map-loading'}`} aria-label="Saaristolauttojen kartta" />
      {resetButton}
      <header className="map-view__header">
        <div className="map-view__brand">
          <img src="/mstile-70x70.png" alt="" />
          <div><strong>Saaristolautat</strong><span>MapLibre + OpenFreeMap</span></div>
        </div>
        <div className="map-view__status"><i />{status}</div>
      </header>
      <aside className="map-view__legend">
        <strong>Karttatasot</strong>
        <span><i className="legend-route" /> Lauttareitit</span>
        <span><i className="legend-cruise" /> Risteilyreitit</span>
        <span><i className="legend-pier" /> Laiturit</span>
        <small>Zoomaa, siirrä karttaa ja klikkaa kohteita.</small>
        {selection && <p><b>Valittu:</b> {selection.name}</p>}
      </aside>
      {debugElement}
    </main>
  );
}

const mapStateToProps = state => ({
  data: state.data.data || {},
  geojson: state.data.geojson || [],
  layers: state.settings.layers,
  locale: state.settings.locale,
  mapTypeId: state.settings.mapTypeId,
  infoContent: state.selection.infoContent,
  infoContent2: state.selection.infoContent2
});
export default connect(mapStateToProps)(MapLibreMap);
