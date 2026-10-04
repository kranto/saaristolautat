import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapLibrePrototype.css';
import { phases } from '../lib/constants';

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const googleZoomToMapLibre = zoom => Number(zoom) - 1;
const legacyEmSize = em => ['interpolate', ['linear'], ['zoom'], 4, em * 6, 18, em * 20];

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
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(32, 32);
    context.lineTo(32 + dx * 24, 32 + dy * 24);
    context.stroke();
    context.beginPath();
    context.arc(32 + dx * 26, 32 + dy * 26, 7, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    map.addImage(imageName, context.getImageData(0, 0, 64, 64), { pixelRatio: 2 });
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
const normalRouteOpacities = new WeakMap();

function updateLiveIndicator(map, features, dispatch) {
  const current = features.filter(feature => feature.properties.age < 600);
  if (!current.length) {
    dispatch({ type: 'UPDATE_INDICATOR_MSG', payload: ['live.notavailable'] });
    return;
  }
  if (map.getZoom() < googleZoomToMapLibre(8)) {
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
        markerMinZoom: googleZoomToMapLibre(properties.markerVisibleFrom ?? pierDefaults[subtype]?.marker ?? 30),
        labelMinZoom: googleZoomToMapLibre(properties.labelVisibleFrom ?? pierDefaults[subtype]?.label ?? placeDefaults[subtype]?.from ?? 30),
        labelMaxZoom: googleZoomToMapLibre(properties.labelVisibleTo ?? placeDefaults[subtype]?.to ?? 30),
        longNameMinZoom: googleZoomToMapLibre(properties.longNameFrom ?? 9),
        objectMinZoom: googleZoomToMapLibre(properties.minZ ?? properties.visibleFrom ?? (isRoute ? (subtype === 'cableferry' || subtype === 'conn5' || subtype === 'conn50' ? 9 : 8) : properties.stype === 'road' ? 8 : properties.stype === 'box' || properties.stype === 'pin' ? 11 : 1)),
        objectMaxZoom: googleZoomToMapLibre(properties.maxZ ?? properties.visibleTo ?? (properties.stype === 'road' ? 8 : properties.stype === 'box' ? 15 : 30)),
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
  if (!map?.isStyleLoaded()) return;
  const groups = {
    roadferries: ['ferry-routes-shadow', 'ferry-routes', 'ferry-routes-hit'],
    conn4: ['connecting-routes-shadow', 'connecting-routes', 'connecting-routes-hit'],
    conn5: ['cruise-routes', 'cruise-routes-hit'],
    longdistanceferries: ['long-distance-routes', 'long-distance-routes-hit'],
    ringroads: ['ring-roads'],
    distances: ['distance-pins']
  };
  const styleLayerIds = map.getStyle().layers.map(layer => layer.id);
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

function MapLibrePrototype({ data, geojson, dispatch, embedded = false, layers, locale, infoContent, infoContent2 }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const hoverPopupRef = useRef(null);
  const hasSelectionRef = useRef(false);
  const liveFeaturesRef = useRef([]);
  const [status, setStatus] = useState('Ladataan karttaa…');
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return undefined;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: OPENFREEMAP_STYLE,
      center: [21.4, 60.18],
      zoom: 8.2,
      minZoom: 5,
      maxZoom: 17,
      attributionControl: false
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    map.on('load', () => {
      customizeBaseMap(map);
      setStatus('Kartta valmis');
      if (embedded) dispatch({ type: 'PHASE_CHANGED', payload: phases.NORMAL_USE });
    });
    map.on('error', event => {
      console.error('MapLibre error', event.error);
      setStatus('Karttapohjan lataus epäonnistui');
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [dispatch, embedded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data?.piers || !geojson?.length) return undefined;
    const sourceData = flattenMapData(geojson, data, locale);

    function addLayers() {
      if (map.getSource('saaristolautat')) {
        map.getSource('saaristolautat').setData(sourceData);
        return;
      }
      map.addSource('saaristolautat', { type: 'geojson', data: sourceData, generateId: true });
      addCableFerryRingImage(map);
      addDirectionalPinImages(map);

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
        layout: { 'icon-image': ['concat', 'direction-pin-', ['get', 'subtype']], 'icon-size': 0.6, 'icon-allow-overlap': true }
      });
      const boxRanges = [...new Set(sourceData.features.filter(feature => feature.properties.kind === 'box')
        .map(feature => `${feature.properties.objectMinZoom}-${feature.properties.objectMaxZoom}`))];
      boxRanges.forEach(range => {
        const [from, to] = range.split('-').map(Number);
        map.addLayer({
          id: `distance-boxes-${range}`, type: 'symbol', source: 'saaristolautat', minzoom: from, maxzoom: to + 1,
          filter: ['all', ['==', ['get', 'kind'], 'box'], ['==', ['get', 'objectMinZoom'], from], ['==', ['get', 'objectMaxZoom'], to]],
          layout: {
            'text-field': ['get', 'description'], 'text-font': ['Noto Sans Regular'], 'text-size': legacyEmSize(0.9),
            'text-offset': ['array', 'number', 2, ['get', 'labelOffset']], 'text-anchor': ['get', 'labelTextAnchor'], 'text-optional': true,
            'text-allow-overlap': true, 'text-ignore-placement': true
          },
          paint: { 'text-color': '#ffffff', 'text-halo-color': 'rgba(0,101,189,0.8)', 'text-halo-width': 5 }
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
          paint: { 'text-color': '#002080', 'text-opacity': 0.9, 'text-halo-color': 'rgba(255,255,255,0.5)', 'text-halo-width': 1 }
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
          map.addLayer({ id: `place-labels-${placeStyle.type}-${range.replaceAll(',', '-')}`, type: 'symbol', source: 'saaristolautat', minzoom: from, ...(to < googleZoomToMapLibre(30) ? { maxzoom: to + 1 } : {}),
            filter: ['all', ['==', ['get', 'kind'], 'place'], ['==', ['get', 'subtype'], placeStyle.type], ['==', ['get', 'labelMinZoom'], from], ['==', ['get', 'labelMaxZoom'], to], ['==', ['get', 'longNameMinZoom'], longNameFrom]],
            layout: { 'text-field': ['step', ['zoom'], ['get', 'name'], longNameFrom, ['get', 'longName']], 'text-font': [placeStyle.font], 'text-size': legacyEmSize(placeStyle.em),
              'text-offset': ['array', 'number', 2, ['get', 'labelOffset']], 'text-anchor': ['get', 'labelTextAnchor'], 'text-optional': true,
              'text-justify': 'left',
              'text-allow-overlap': true, 'text-ignore-placement': true },
            paint: { 'text-color': placeStyle.color, 'text-opacity': placeStyle.opacity, 'text-halo-color': 'rgba(255,255,255,0.5)', 'text-halo-width': 1 }
          });
        });
      });
      const routeLayers = routeHitLayers.map(layer => layer.id);

      routeLayers.forEach(layer => {
        map.on('mouseenter', layer, event => {
          const feature = event.features?.[0];
          if (!feature) return;
          const hoveredFeatures = map.queryRenderedFeatures(event.point, { layers: [layer] });
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
        map.on('mouseleave', layer, () => {
          map.getCanvas().style.cursor = '';
          map.setFilter('route-hover-highlight', ['all', ['==', ['get', 'kind'], 'route'], ['==', ['get', 'ref'], '__no-route__']]);
          map.setFilter('cable-ferry-hover-highlight', ['all', ['==', ['get', 'kind'], 'cable-ferry-highlight'], ['==', ['get', 'ref'], '__no-route__']]);
          hoverPopupRef.current?.remove();
          hoverPopupRef.current = null;
        });
        map.on('click', layer, event => {
          const feature = event.features?.[0];
          if (!feature) return;
          const clickedFeatures = map.queryRenderedFeatures(event.point, { layers: [layer] });
          const refs = [...new Set(clickedFeatures.map(item => item.properties.ref))];
          const names = [...new Set(clickedFeatures.map(item => item.properties.name).filter(Boolean))];
          map.setFilter('route-selected-highlight', ['all', ['==', ['get', 'kind'], 'route'], ['in', ['get', 'ref'], ['literal', refs]]]);
          map.setFilter('cable-ferry-selected-highlight', ['all', ['==', ['get', 'kind'], 'cable-ferry-highlight'], ['in', ['get', 'ref'], ['literal', refs]]]);
          const selectedName = names.join(' / ');
          setSelection({ name: selectedName });
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
        });
      });

      map.on('click', event => {
        if (!hasSelectionRef.current) return;
        if (map.queryRenderedFeatures(event.point, { layers: routeLayers }).length) return;
        window.history.pushState({ route: null, timetable: null }, null, null);
        dispatch({ type: 'INFOCONTENT_UNSELECTED', payload: null });
      });

      const routeCount = sourceData.features.filter(feature => feature.properties.kind === 'route').length;
      const pierCount = sourceData.features.filter(feature => feature.properties.kind === 'pier').length;
      const placeCount = sourceData.features.filter(feature => feature.properties.kind === 'place').length;
      setStatus(`${routeCount} reittiosuutta · ${pierCount} laituria · ${placeCount} paikannimeä`);
      applyLayerSettings(map, layers);
    }

    if (map.loaded()) addLayers();
    else map.once('load', addLayers);
    return undefined;
  }, [data, dispatch, geojson, locale]);

  useEffect(() => {
    applyLayerSettings(mapRef.current, layers);
  }, [layers]);

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
        id: 'live-history', type: 'line', source: 'live-history', minzoom: googleZoomToMapLibre(8),
        paint: { 'line-color': '#a0a0a0', 'line-width': 0.5, 'line-opacity': 0.7 }
      });
      if (!map.getLayer('live-vessels')) map.addLayer({
        id: 'live-vessels', type: 'symbol', source: 'live-vessels', minzoom: googleZoomToMapLibre(8),
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
        id: 'live-vessel-labels', type: 'symbol', source: 'live-vessels', minzoom: googleZoomToMapLibre(9),
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['case', ['>', ['get', 'sog'], 0.1], 12, 8],
          'text-offset': ['case', ['>', ['get', 'sog'], 0.1], ['literal', [-0.35, -0.35]], ['literal', [-0.2, -0.2]]],
          'text-anchor': 'bottom-right',
          'text-allow-overlap': true, 'text-ignore-placement': true
        },
        paint: { 'text-color': '#880078', 'text-halo-color': 'rgba(255,255,255,0.9)', 'text-halo-width': 1 }
      });
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

  if (embedded) {
    return <div ref={mapContainer} id="map" className="map maplibre-embedded" aria-label="Saaristolauttojen kartta" />;
  }

  return (
    <main className="map-prototype">
      <div ref={mapContainer} className="map-prototype__canvas" aria-label="Saaristolauttojen kartta" />
      <header className="map-prototype__header">
        <div className="map-prototype__brand">
          <img src="/mstile-70x70.png" alt="" />
          <div><strong>Saaristolautat</strong><span>MapLibre + OpenFreeMap -kokeilu</span></div>
        </div>
        <div className="map-prototype__status"><i />{status}</div>
      </header>
      <aside className="map-prototype__legend">
        <strong>Karttatasot</strong>
        <span><i className="legend-route" /> Lauttareitit</span>
        <span><i className="legend-cruise" /> Risteilyreitit</span>
        <span><i className="legend-pier" /> Laiturit</span>
        <small>Zoomaa, siirrä karttaa ja klikkaa kohteita.</small>
        {selection && <p><b>Valittu:</b> {selection.name}</p>}
      </aside>
    </main>
  );
}

const mapStateToProps = state => ({
  data: state.data.data || {},
  geojson: state.data.geojson || [],
  layers: state.settings.layers,
  locale: state.settings.locale,
  infoContent: state.selection.infoContent,
  infoContent2: state.selection.infoContent2
});
export default connect(mapStateToProps)(MapLibrePrototype);
