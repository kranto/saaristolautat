import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapLibrePrototype.css';

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
      map.setPaintProperty(layer.id, 'background-color', '#bfd8bd');
    } else if (sourceLayer === 'water' && layer.type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', '#f3f7fd');
      map.setPaintProperty(layer.id, 'fill-opacity', 1);
    } else if (sourceLayer === 'waterway' && layer.type === 'line') {
      map.setPaintProperty(layer.id, 'line-color', '#dce7f3');
    } else if (sourceLayer === 'landcover' && layer.type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', '#acd2b1');
    } else if (sourceLayer === 'landuse' && layer.type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', '#b8d4b5');
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

function localizedName(item = {}) {
  const name = item.name_fi || item.name || item.sname_fi || item.sname || '';
  return name.replace(/<br\s*\/?\s*>/gi, '\n');
}

function localizedLongName(item = {}) {
  const firstName = localizedName(item);
  const alternatives = [item.sname, item.sname_fi, item.sname_sv, item.sname_en, item.name, item.name_fi, item.name_sv, item.name_en]
    .map(name => (name || '').replace(/<br\s*\/?\s*>/gi, '\n'))
    .filter((name, index, names) => name && name !== firstName && names.indexOf(name) === index);
  return [firstName, ...alternatives].join('\n');
}

function localizedDescription(item = {}) {
  return (item.description_fi || item.description || '').replace(/<br\s*\/?\s*>/gi, '\n');
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

function flattenMapData(collections, data) {
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
    const name = localizedName(sourceItem || properties);
    const longName = localizedLongName(sourceItem || properties);
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
        description: localizedDescription(properties),
        subtype,
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
    }
  }

  collections.forEach(collection => visit(collection));
  (data.lauttaLegs || []).forEach(leg => {
    features.push({
      type: 'Feature',
      properties: { kind: 'route', ref: `longdistance-${leg.id}`, name: leg.name, subtype: 'longdistance', color: '' },
      geometry: {
        type: 'LineString',
        coordinates: leg.path.split(' ').map(point => point.split(',').slice(0, 2).map(Number))
      }
    });
  });
  return { type: 'FeatureCollection', features };
}

function popupHtml(feature) {
  const type = feature.properties.kind === 'pier' ? 'Laituri' : 'Lauttareitti';
  return `<div class="map-popup"><span>${type}</span><strong>${feature.properties.name}</strong></div>`;
}

function MapLibrePrototype({ data, geojson }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const hoverPopupRef = useRef(null);
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
    });
    map.on('error', event => {
      console.error('MapLibre error', event.error);
      setStatus('Karttapohjan lataus epäonnistui');
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data?.piers || !geojson?.length) return undefined;
    const sourceData = flattenMapData(geojson, data);

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
      const cableFerryMinZooms = [...new Set(sourceData.features
        .filter(feature => feature.properties.kind === 'route' && feature.properties.subtype === 'cableferry')
        .map(feature => feature.properties.objectMinZoom))].sort((a, b) => a - b);

      map.addLayer({
        id: 'ferry-routes-shadow', type: 'line', source: 'saaristolautat',
        filter: solidRouteFilter, minzoom: 7,
        paint: { 'line-color': '#ffffff', 'line-width': ['+', routeWidth, 2], 'line-opacity': 0.85 }
      });
      map.addLayer({
        id: 'ferry-routes', type: 'line', source: 'saaristolautat',
        filter: solidRouteFilter, minzoom: 7,
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
        filter: ['all', ['==', ['get', 'kind'], 'route'], ['==', ['get', 'subtype'], 'longdistance']],
        minzoom: 6, maxzoom: 11,
        paint: { 'line-color': '#e08080', 'line-width': 1.5, 'line-opacity': 0.4, 'line-dasharray': [1, 1] }
      });

      map.addLayer({
        id: 'route-highlight', type: 'line', source: 'saaristolautat',
        filter: ['all', ['==', ['get', 'kind'], 'route'], ['==', ['get', 'ref'], '__no-route__']],
        paint: { 'line-color': '#f97cdc', 'line-width': ['+', routeWidth, 8], 'line-opacity': 0.7 }
      });

      const routeHitLayers = [
        { id: 'ferry-routes-hit', filter: solidRouteFilter, minzoom: 7 },
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
      const pierLayers = [];
      pierStyles.forEach(pierStyle => {
        const items = sourceData.features.filter(feature => feature.properties.kind === 'pier' && feature.properties.subtype === pierStyle.type);
        [...new Set(items.map(feature => feature.properties.markerMinZoom))].filter(zoom => zoom < 30).forEach(zoom => {
          const id = `piers-${pierStyle.type}-${zoom}`;
          pierLayers.push(id);
          map.addLayer({ id, type: 'circle', source: 'saaristolautat', minzoom: zoom,
            filter: ['all', ['==', ['get', 'kind'], 'pier'], ['==', ['get', 'subtype'], pierStyle.type], ['==', ['get', 'markerMinZoom'], zoom]],
            paint: { 'circle-radius': pierStyle.radius, 'circle-color': '#e00000', 'circle-opacity': pierStyle.opacity }
          });
        });
        [...new Set(items.map(feature => feature.properties.labelMinZoom))].filter(zoom => zoom < 30).forEach(zoom => map.addLayer({
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
          map.getCanvas().style.cursor = 'pointer';
          map.setFilter('route-highlight', ['all', ['==', ['get', 'kind'], 'route'], ['==', ['get', 'ref'], feature.properties.ref]]);
          hoverPopupRef.current?.remove();
          hoverPopupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'route-hover-popup', offset: 14 })
            .setLngLat(event.lngLat)
            .setHTML(`<strong>${feature.properties.name}</strong>`)
            .addTo(map);
        });
        map.on('mousemove', layer, event => hoverPopupRef.current?.setLngLat(event.lngLat));
        map.on('mouseleave', layer, () => {
          map.getCanvas().style.cursor = '';
          map.setFilter('route-highlight', ['all', ['==', ['get', 'kind'], 'route'], ['==', ['get', 'ref'], '__no-route__']]);
          hoverPopupRef.current?.remove();
          hoverPopupRef.current = null;
        });
        map.on('click', layer, event => {
          if (map.queryRenderedFeatures(event.point, { layers: pierLayers }).length) return;
          const feature = event.features?.[0];
          if (!feature) return;
          setSelection({ name: feature.properties.name });
          popupRef.current?.remove();
          popupRef.current = new maplibregl.Popup({ closeButton: false, offset: 4 })
            .setLngLat(event.lngLat).setHTML(popupHtml(feature)).addTo(map);
        });
      });

      pierLayers.forEach(layer => {
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
        map.on('click', layer, event => {
          const feature = event.features?.[0];
          if (!feature) return;
          setSelection({ name: feature.properties.name });
          popupRef.current?.remove();
          popupRef.current = new maplibregl.Popup({ closeButton: false, offset: 10 })
            .setLngLat(event.lngLat).setHTML(popupHtml(feature)).addTo(map);
        });
      });

      const routeCount = sourceData.features.filter(feature => feature.properties.kind === 'route').length;
      const pierCount = sourceData.features.filter(feature => feature.properties.kind === 'pier').length;
      const placeCount = sourceData.features.filter(feature => feature.properties.kind === 'place').length;
      setStatus(`${routeCount} reittiosuutta · ${pierCount} laituria · ${placeCount} paikannimeä`);
    }

    if (map.loaded()) addLayers();
    else map.once('load', addLayers);
    return undefined;
  }, [data, geojson]);

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

const mapStateToProps = state => ({ data: state.data.data || {}, geojson: state.data.geojson || [] });
export default connect(mapStateToProps)(MapLibrePrototype);
