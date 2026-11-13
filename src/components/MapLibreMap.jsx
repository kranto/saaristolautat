import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapLibreMap.css';
import { phases } from '../lib/constants';
import { mapDataReady, registerMapNavigation, registerMapPierTooltip, registerMapView } from '../lib/mapnavigation';
import { hideMenuAndSettings } from '../lib/uicontrol';

maplibregl.setWorkerUrl(maplibreWorkerUrl);
const pmtilesProtocol = new Protocol();
maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const RASTER_BASE_LAYERS = {
  OSM: 'base-osm'
};
const SHOW_MAP_DEBUG = typeof window !== 'undefined' && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
const TERRAIN_LANDCOVER = {
  archive: 'landcover-archipelago-sea-kmtk.pmtiles',
  attribution: 'Lähde: Maanmittauslaitos, Kansallinen maastotietokanta BETA (CC BY 4.0)',
  label: 'KMTK'
};
const DEFAULT_URBAN_LANDCOVER = {
  archive: 'landcover-archipelago-sea-kmtk-urban.pmtiles',
  attribution: 'Lähde: Maanmittauslaitos, Kansallinen maastotietokanta BETA (CC BY 4.0)'
};
const COMPLEMENTARY_FOREST = {
  archive: 'landcover-archipelago-sea-syke-forest-smoothed.pmtiles',
  attribution: 'Lähde: Syke, Maanpeite 2 m 2022 (CC BY 4.0), kartografisesti pehmennetty'
};
const mapParameters = new URLSearchParams(window.location.search);
const landcoverParameter = mapParameters.get('landcover');
const COMPLEMENTARY_LANDCOVER_ENABLED = !SHOW_MAP_DEBUG || landcoverParameter !== '0';
const COMPLEMENTARY_FOREST_ENABLED = COMPLEMENTARY_LANDCOVER_ENABLED;
const screenshotCenter = mapParameters.get('screenshotCenter')?.split(',').map(Number);
const screenshotZoom = Number(mapParameters.get('screenshotZoom'));
const SCREENSHOT_MAP_VIEW = (import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'test') &&
  screenshotCenter?.length === 2 && screenshotCenter.every(Number.isFinite) && Number.isFinite(screenshotZoom)
  ? { center: screenshotCenter, zoom: screenshotZoom }
  : null;
const legacyZoomToMapLibre = zoom => Number(zoom) - 1;
const mapLibreZoomToExternal = zoom => Number(zoom) + 1;
const legacyEmSize = em => ['interpolate', ['linear'], ['zoom'], 4, em * 6, 18, em * 20];
const DISTANCE_SIGN_MIN_ZOOM = 10;
const DISTANCE_SIGN_FULL_SIZE_ZOOM = 12;
const DISTANCE_SIGN_MIN_TEXT_SIZE = 9.9;
const DISTANCE_SIGN_MAX_TEXT_SIZE = 14.4;
const DISTANCE_SIGN_MAX_ZOOM = 13;
const distanceSignTextSize = zoom => {
  const progress = Math.max(0, Math.min(1,
    (zoom - DISTANCE_SIGN_MIN_ZOOM) / (DISTANCE_SIGN_FULL_SIZE_ZOOM - DISTANCE_SIGN_MIN_ZOOM)));
  return DISTANCE_SIGN_MIN_TEXT_SIZE + progress * (DISTANCE_SIGN_MAX_TEXT_SIZE - DISTANCE_SIGN_MIN_TEXT_SIZE);
};
const LAND_DETAIL_ZOOM_START = 8;
const LAND_DETAIL_ZOOM_END = 10;
const LANDCOVER_OPACITY_CAP_ZOOM = 9.65;
const LANDCOVER_OPACITY_CAP_RATIO = (LANDCOVER_OPACITY_CAP_ZOOM - LAND_DETAIL_ZOOM_START)
  / (LAND_DETAIL_ZOOM_END - LAND_DETAIL_ZOOM_START);
const DEVELOPED_AREA_FADE_ZOOM_START = 14;
const DEVELOPED_AREA_FADE_ZOOM_END = 15;
const SIMPLE_DEVELOPED_AREA_FADE_IN_ZOOM_START = 9.5;
const SIMPLE_DEVELOPED_AREA_FADE_IN_ZOOM_END = LANDCOVER_OPACITY_CAP_ZOOM + 1;
const LANDCOVER_TUNING_STORAGE_KEY = 'saaristolautat.landcoverTuning.v1';
const SIMPLE_LAND_COLOR = '#b8dfc2';
const SIMPLE_LAND_DETAIL_COLOR = '#d4e8d8';
const SIMPLE_WATER_COLOR = '#f3f7fd';
const LANDCOVER_TUNING_DEFAULTS = {
  forest: { label: 'Metsä', color: '#72c10b', opacity: 0.65 },
  farmland: { label: 'Pelto', color: '#f7e469', opacity: 1 },
  rock: { label: 'Avokallio', color: '#d9d8cf', opacity: 1 },
  open: { label: 'Avoin maa', color: '#c9d4b1', opacity: 1 },
  wetland: { label: 'Kosteikko', color: '#8497d2', opacity: 0.65 },
  sand: { label: 'Hiekka', color: '#ffd875', opacity: 1 },
  bare: { label: 'Paljas maa', color: '#d1c4ae', opacity: 1 },
  urban: { label: 'Rakennettu', color: '#cdb9a8', opacity: 1 },
  park: { label: 'Puisto', color: '#b9e49b', opacity: 1 },
  ice: { label: 'Jää / lumi', color: '#e7f0f2', opacity: 1 }
};
const openFreeMapOverviewOpacities = new WeakMap();
const ROUTE_AREA_BOUNDS = [[19.45, 59.72], [23.05, 60.58]];
const MIN_ROUTE_RENDER_ZOOM = 7;
const HIITTINEN = [22.69, 59.88];
const ARCHIPELAGO_BOUNDS = { south: 59.72, west: 19, north: 60.54, east: 23 };
const noRouteFilter = kind => ['all', ['==', ['get', 'kind'], kind], ['==', ['get', 'ref'], '__no-route__']];

function defaultLandcoverTuning() {
  return Object.fromEntries(Object.entries(LANDCOVER_TUNING_DEFAULTS).map(([key, value]) => (
    [key, { ...value }]
  )));
}

function loadLandcoverTuning() {
  const defaults = defaultLandcoverTuning();
  if (!SHOW_MAP_DEBUG) return defaults;
  try {
    const stored = JSON.parse(window.localStorage.getItem(LANDCOVER_TUNING_STORAGE_KEY));
    Object.keys(defaults).forEach(key => {
      const color = stored?.[key]?.color;
      const opacity = Number(stored?.[key]?.opacity);
      if (/^#[0-9a-f]{6}$/i.test(color)) defaults[key].color = color;
      if (Number.isFinite(opacity)) defaults[key].opacity = Math.max(0, Math.min(1, opacity));
    });
  } catch {
    // Ignore malformed local tuning values and use the checked-in defaults.
  }
  return defaults;
}

const landcoverFadeExpression = endOpacity => [
  'interpolate', ['linear'], ['zoom'],
  LAND_DETAIL_ZOOM_START, 0,
  LANDCOVER_OPACITY_CAP_ZOOM, endOpacity * LANDCOVER_OPACITY_CAP_RATIO
];

const cappedOpacity = (overviewOpacity, detailOpacity) => (
  overviewOpacity + LANDCOVER_OPACITY_CAP_RATIO * (detailOpacity - overviewOpacity)
);

function complementaryLandcoverColorExpression(tuning) {
  return ['match', ['get', 'class'],
    'forest', tuning.forest.color,
    'farmland', tuning.farmland.color,
    'open', tuning.open.color,
    'rock', tuning.rock.color,
    'wetland', tuning.wetland.color,
    'sand', tuning.sand.color,
    'bare', tuning.bare.color,
    'urban', tuning.urban.color,
    '#dedfc9'];
}

function complementaryLandcoverOpacityExpression(tuning) {
  const opacityAtCap = ['match', ['get', 'class'],
    'forest', tuning.forest.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'farmland', tuning.farmland.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'open', tuning.open.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'rock', tuning.rock.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'wetland', tuning.wetland.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'sand', tuning.sand.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'bare', tuning.bare.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'urban', tuning.urban.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    LANDCOVER_OPACITY_CAP_RATIO];
  const opacityAfterDevelopedFade = ['match', ['get', 'class'],
    'forest', tuning.forest.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'farmland', tuning.farmland.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'open', tuning.open.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'rock', tuning.rock.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'wetland', tuning.wetland.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'sand', tuning.sand.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'bare', tuning.bare.opacity * LANDCOVER_OPACITY_CAP_RATIO,
    'urban', 0,
    LANDCOVER_OPACITY_CAP_RATIO];
  return ['interpolate', ['linear'], ['zoom'],
    LAND_DETAIL_ZOOM_START, 0,
    LANDCOVER_OPACITY_CAP_ZOOM, opacityAtCap,
    DEVELOPED_AREA_FADE_ZOOM_START, opacityAtCap,
    DEVELOPED_AREA_FADE_ZOOM_END, opacityAfterDevelopedFade];
}

function openFreeMapLandcoverOpacityExpression(tuning, overviewOpacity) {
  const opacityAtOverview = ['match', ['get', 'class'],
    'wood', overviewOpacity * tuning.forest.opacity,
    'grass', overviewOpacity * tuning.open.opacity,
    'farmland', overviewOpacity * tuning.farmland.opacity,
    'rock', overviewOpacity * tuning.rock.opacity,
    'wetland', overviewOpacity * tuning.wetland.opacity,
    'sand', overviewOpacity * tuning.sand.opacity,
    'bare', overviewOpacity * tuning.bare.opacity,
    'ice', overviewOpacity * tuning.ice.opacity,
    overviewOpacity];
  const opacityAtCap = ['match', ['get', 'class'],
    'wood', cappedOpacity(overviewOpacity * tuning.forest.opacity, 0.9 * tuning.forest.opacity),
    'grass', cappedOpacity(overviewOpacity * tuning.open.opacity, 0.82 * tuning.open.opacity),
    'farmland', cappedOpacity(overviewOpacity * tuning.farmland.opacity, 0.88 * tuning.farmland.opacity),
    'rock', cappedOpacity(overviewOpacity * tuning.rock.opacity, 0.78 * tuning.rock.opacity),
    'ice', cappedOpacity(overviewOpacity * tuning.ice.opacity, 0.9 * tuning.ice.opacity),
    'sand', cappedOpacity(overviewOpacity * tuning.sand.opacity, 0.85 * tuning.sand.opacity),
    'bare', cappedOpacity(overviewOpacity * tuning.bare.opacity, 0.78 * tuning.bare.opacity),
    'wetland', cappedOpacity(overviewOpacity * tuning.wetland.opacity, 0.8 * tuning.wetland.opacity),
    cappedOpacity(overviewOpacity, 0.55)];
  return ['interpolate', ['linear'], ['zoom'],
    LAND_DETAIL_ZOOM_START, opacityAtOverview,
    LANDCOVER_OPACITY_CAP_ZOOM, opacityAtCap];
}

function openFreeMapLanduseOpacityExpression(tuning, overviewOpacity) {
  const developedClasses = ['residential', 'commercial', 'industrial', 'retail'];
  const opacityAtCap = ['match', ['get', 'class'],
    developedClasses, cappedOpacity(
      overviewOpacity * tuning.urban.opacity,
      0.88 * tuning.urban.opacity
    ),
    cappedOpacity(overviewOpacity, 0.88)];
  const opacityAfterDevelopedFade = ['match', ['get', 'class'],
    developedClasses, 0,
    cappedOpacity(overviewOpacity, 0.88)];
  return ['interpolate', ['linear'], ['zoom'],
    LAND_DETAIL_ZOOM_START,
    ['match', ['get', 'class'], developedClasses, overviewOpacity * tuning.urban.opacity, overviewOpacity],
    LANDCOVER_OPACITY_CAP_ZOOM, opacityAtCap,
    DEVELOPED_AREA_FADE_ZOOM_START, opacityAtCap,
    DEVELOPED_AREA_FADE_ZOOM_END, opacityAfterDevelopedFade];
}

function simplifiedDevelopedAreaOpacityExpression(tuning) {
  const detailedDevelopedOpacity = cappedOpacity(tuning.urban.opacity, 0.88 * tuning.urban.opacity);
  return ['interpolate', ['linear'], ['zoom'],
    SIMPLE_DEVELOPED_AREA_FADE_IN_ZOOM_START, 0,
    SIMPLE_DEVELOPED_AREA_FADE_IN_ZOOM_END, detailedDevelopedOpacity,
    DEVELOPED_AREA_FADE_ZOOM_START, detailedDevelopedOpacity,
    DEVELOPED_AREA_FADE_ZOOM_END, 0];
}

function simplifiedDevelopedLanduseOpacityExpression(tuning, overviewOpacity) {
  const developedClasses = ['residential', 'commercial', 'industrial', 'retail'];
  const detailedDevelopedOpacity = cappedOpacity(
    overviewOpacity * tuning.urban.opacity,
    0.88 * tuning.urban.opacity
  );
  const developedOpacity = ['match', ['get', 'class'], developedClasses, detailedDevelopedOpacity, 0];
  return ['interpolate', ['linear'], ['zoom'],
    SIMPLE_DEVELOPED_AREA_FADE_IN_ZOOM_START, 0,
    SIMPLE_DEVELOPED_AREA_FADE_IN_ZOOM_END, developedOpacity,
    DEVELOPED_AREA_FADE_ZOOM_START, developedOpacity,
    DEVELOPED_AREA_FADE_ZOOM_END, 0];
}

function transportationLineColorExpression(layerId, simplified = false) {
  const isCasing = layerId.includes('casing');
  const isPrimaryRoad = ['motorway', 'trunk', 'primary'].some(roadClass => layerId.includes(roadClass));
  const isSecondaryRoad = layerId.includes('secondary');
  const isTertiaryRoad = layerId.includes('tertiary');
  const isMainRoad = isPrimaryRoad || isSecondaryRoad;
  const isMinorRoad = ['minor', 'street'].some(roadClass => layerId.includes(roadClass));
  const isRail = layerId.includes('rail');
  const isPath = ['path', 'pedestrian', 'track'].some(roadClass => layerId.includes(roadClass));
  const overviewColor = simplified
    ? (isCasing
      ? (isPrimaryRoad ? '#52605b'
        : isSecondaryRoad ? '#737d78'
          : isTertiaryRoad ? '#909792'
            : isMinorRoad ? '#a5aaa4' : '#bec2bd')
      : isPrimaryRoad ? '#83918b'
        : isSecondaryRoad ? '#a9b2ad'
          : isTertiaryRoad ? '#c4c9c4'
            : isMinorRoad ? '#d6d9d4' : '#eef0eb')
    : (isCasing ? '#8b918e' : isMainRoad ? '#9da3a0' : '#b1b6b3');
  let detailColor;
  if (!simplified) {
    detailColor = isRail ? '#747474'
      : isCasing ? (isMainRoad ? '#b34f38' : isMinorRoad ? '#918d83' : '#c7c3b9')
        : isMainRoad ? '#ed7250'
          : isMinorRoad ? '#d9a36d'
            : isPath ? '#85857f' : '#fffdf5';
  } else if (isRail) {
    detailColor = '#747474';
  } else if (isCasing) {
    detailColor = isPrimaryRoad ? '#31453f'
      : isSecondaryRoad ? '#55645e'
        : isTertiaryRoad ? '#747b73'
          : isMinorRoad ? '#6f7872' : '#adb3aa';
  } else {
    detailColor = isPrimaryRoad ? '#6d8279'
      : isSecondaryRoad ? '#a2b0a8'
        : isTertiaryRoad ? '#d0d7cf'
          : isMinorRoad ? '#dfe5dd'
            : isPath ? '#7f857e' : '#fafbf5';
  }
  return [
    'interpolate', ['linear'], ['zoom'],
    LAND_DETAIL_ZOOM_START, overviewColor,
    LAND_DETAIL_ZOOM_END, detailColor
  ];
}

function transportationLineWidthExpression(layerId, simplified = false) {
  const isCasing = layerId.includes('casing');
  const isPrimaryRoad = ['motorway', 'trunk', 'primary'].some(roadClass => layerId.includes(roadClass));
  const isSecondaryRoad = layerId.includes('secondary');
  const isTertiaryRoad = layerId.includes('tertiary');
  const isMainRoad = isPrimaryRoad || isSecondaryRoad;
  const isMinorRoad = ['minor', 'street'].some(roadClass => layerId.includes(roadClass));

  if (!simplified) {
    return isCasing
      ? ['interpolate', ['linear'], ['zoom'], 7, 0.8, 11, 1.8, 15, 4]
      : isMainRoad
        ? ['interpolate', ['linear'], ['zoom'], 7, 0.5, 11, 1.2, 15, 3]
        : isMinorRoad
          ? ['interpolate', ['linear'], ['zoom'], 9, 0.4, 12, 1, 15, 2.2]
          : ['interpolate', ['linear'], ['zoom'], 9, 0.35, 12, 0.8, 15, 1.8];
  }

  if (isCasing) {
    if (isPrimaryRoad) return ['interpolate', ['linear'], ['zoom'], 7, 0.9, 11, 2.3, 15, 5.2];
    if (isSecondaryRoad) return ['interpolate', ['linear'], ['zoom'], 7, 0.75, 11, 1.9, 15, 4.3];
    if (isTertiaryRoad) return ['interpolate', ['linear'], ['zoom'], 8, 0.6, 11, 1.55, 15, 3.5];
    if (isMinorRoad) return ['interpolate', ['linear'], ['zoom'], 9, 0.5, 12, 1.3, 15, 3];
    return ['interpolate', ['linear'], ['zoom'], 10, 0.3, 12, 0.75, 15, 1.8];
  }
  if (isPrimaryRoad) return ['interpolate', ['linear'], ['zoom'], 7, 0.55, 11, 1.5, 15, 3.8];
  if (isSecondaryRoad) return ['interpolate', ['linear'], ['zoom'], 7, 0.45, 11, 1.2, 15, 3];
  if (isTertiaryRoad) return ['interpolate', ['linear'], ['zoom'], 8, 0.35, 11, 0.95, 15, 2.3];
  if (isMinorRoad) return ['interpolate', ['linear'], ['zoom'], 9, 0.35, 12, 0.85, 15, 1.9];
  return ['interpolate', ['linear'], ['zoom'], 10, 0.25, 12, 0.55, 15, 1.15];
}

function knownVesselNamesByMmsi(data) {
  return new Map(Object.values(data?.ferries || {})
    .filter(vessel => vessel.mmsi && vessel.name)
    .map(vessel => [Number(vessel.mmsi), vessel.shortname || vessel.name]));
}

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
  const firstLandLayer = map.getLayer('park') ? 'park' : undefined;
  const firstLanduseLayer = map.getLayer('landuse_residential') ? 'landuse_residential' : firstLandLayer;
  if (!map.getLayer('landcover-farmland-detail')) map.addLayer({
    id: 'landcover-farmland-detail', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover',
    minzoom: LAND_DETAIL_ZOOM_START,
    filter: ['==', ['get', 'class'], 'farmland'],
    paint: { 'fill-color': '#f4e9b2', 'fill-opacity': 0 }
  }, firstLandLayer);
  if (!map.getLayer('landcover-rock-detail')) map.addLayer({
    id: 'landcover-rock-detail', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover',
    minzoom: LAND_DETAIL_ZOOM_START,
    filter: ['==', ['get', 'class'], 'rock'],
    paint: { 'fill-color': '#d9d8cf', 'fill-opacity': 0 }
  }, firstLandLayer);
  if (!map.getLayer('landuse-developed-detail')) map.addLayer({
    id: 'landuse-developed-detail', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse',
    minzoom: LAND_DETAIL_ZOOM_START,
    filter: ['match', ['get', 'class'], ['commercial', 'industrial', 'retail'], true, false],
    paint: { 'fill-color': '#e6c49d', 'fill-opacity': 0 }
  }, firstLanduseLayer);

  map.getStyle().layers.forEach(layer => {
    const sourceLayer = layer['source-layer'];
    const layerId = layer.id.toLowerCase();
    const isRoadLabel = layer.type === 'symbol' && (
      sourceLayer === 'transportation_name' ||
      ['road', 'route', 'shield', 'highway', 'transportation'].some(value => layerId.includes(value))
    );
    const isNamedRoadLabel = ['highway-name-major', 'highway-name-minor'].some(value => layerId.includes(value));
    const isPathNameLabel = layerId.includes('highway-name-path');
    const isPoiNameLabel = sourceLayer === 'poi' && layerId.startsWith('poi_r');

    if (isRoadLabel && layer.layout?.['text-field']) {
      map.setPaintProperty(layer.id, 'text-opacity', 1);
      if (isNamedRoadLabel) {
        map.setPaintProperty(layer.id, 'text-color', '#3f3b36');
        map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(255,255,255,0.98)');
        map.setPaintProperty(layer.id, 'text-halo-width', 2);
        map.setPaintProperty(layer.id, 'text-halo-blur', 0.05);
        map.setLayoutProperty(layer.id, 'text-size', [
          'interpolate', ['linear'], ['zoom'],
          12, 12.5,
          14, 14.5,
          16, 16
        ]);
        if (layerId.includes('highway-name-minor')) {
          map.setLayerZoomRange(layer.id, 14, layer.maxzoom ?? 24);
        }
      } else if (isPathNameLabel) {
        map.setPaintProperty(layer.id, 'text-color', '#4b4741');
        map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(255,255,255,0.98)');
        map.setPaintProperty(layer.id, 'text-halo-width', 1.8);
        map.setPaintProperty(layer.id, 'text-halo-blur', 0.05);
        map.setLayoutProperty(layer.id, 'text-size', [
          'interpolate', ['linear'], ['zoom'],
          14, 13,
          16, 14.5,
          18, 16
        ]);
      }
    } else if (layer.type === 'symbol' && layer.layout?.['text-field']) {
      map.setPaintProperty(layer.id, 'text-opacity', ['step', ['zoom'], 1, 7, 0, 12, 1]);
      if (isPoiNameLabel) {
        map.setPaintProperty(layer.id, 'text-color', '#4b4741');
        map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(255,255,255,0.98)');
        map.setPaintProperty(layer.id, 'text-halo-width', 2);
        map.setPaintProperty(layer.id, 'text-halo-blur', 0.05);
        map.setLayoutProperty(layer.id, 'text-size', [
          'interpolate', ['linear'], ['zoom'],
          15, 13,
          17, 14.5,
          19, 16
        ]);
      }
    } else if (layer.type === 'background') {
      map.setPaintProperty(layer.id, 'background-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, '#b8dfc2',
        LAND_DETAIL_ZOOM_END, '#e9e8cf'
      ]);
    } else if (sourceLayer === 'water' && layer.type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, '#f3f7fd',
        LAND_DETAIL_ZOOM_END, '#ffffff'
      ]);
      map.setPaintProperty(layer.id, 'fill-outline-color', '#acd3e8');
      map.setPaintProperty(layer.id, 'fill-opacity', 1);
    } else if (sourceLayer === 'waterway' && layer.type === 'line') {
      map.setPaintProperty(layer.id, 'line-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, '#dce7f3',
        LAND_DETAIL_ZOOM_END, '#61bfe5'
      ]);
    } else if (sourceLayer === 'park' && layer.type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, '#d8e8c8',
        LAND_DETAIL_ZOOM_END, '#b9e49b'
      ]);
      map.setPaintProperty(layer.id, 'fill-opacity', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, 0.7,
        LAND_DETAIL_ZOOM_END, 0.85
      ]);
    } else if (sourceLayer === 'park' && layer.type === 'line') {
      map.setPaintProperty(layer.id, 'line-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, 'rgba(228,241,215,1)',
        LAND_DETAIL_ZOOM_END, '#62b94f'
      ]);
    } else if (sourceLayer === 'landcover' && layer.type === 'fill') {
      let overviewOpacities = openFreeMapOverviewOpacities.get(map);
      if (!overviewOpacities) {
        overviewOpacities = new Map();
        openFreeMapOverviewOpacities.set(map, overviewOpacities);
      }
      if (!overviewOpacities.has(layer.id)) {
        const originalOpacity = layer.paint?.['fill-opacity'];
        overviewOpacities.set(layer.id, typeof originalOpacity === 'number' ? originalOpacity : 1);
      }
      map.setPaintProperty(layer.id, 'fill-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, '#addbb9',
        LAND_DETAIL_ZOOM_END,
        ['match', ['get', 'class'],
          'wood', '#d1ecae',
          'grass', '#e7efae',
          'farmland', '#f4e9b2',
          'rock', '#d9d8cf',
          'ice', '#e7f0f2',
          'sand', '#ecd8a1',
          '#addbb9']
      ]);
      map.setPaintProperty(layer.id, 'fill-opacity', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, layer.paint?.['fill-opacity'] ?? 1,
        LAND_DETAIL_ZOOM_END,
        ['match', ['get', 'class'],
          'wood', 0.9,
          'grass', 0.82,
          'farmland', 0.88,
          'rock', 0.78,
          'ice', 0.9,
          'sand', 0.85,
          'wetland', 0.8,
          0.55]
      ]);
    } else if (sourceLayer === 'landuse' && layer.type === 'fill') {
      let overviewOpacities = openFreeMapOverviewOpacities.get(map);
      if (!overviewOpacities) {
        overviewOpacities = new Map();
        openFreeMapOverviewOpacities.set(map, overviewOpacities);
      }
      if (!overviewOpacities.has(layer.id)) {
        const originalOpacity = layer.paint?.['fill-opacity'];
        overviewOpacities.set(layer.id, typeof originalOpacity === 'number' ? originalOpacity : 1);
      }
      map.setLayerZoomRange(layer.id, layer.minzoom ?? 0, 24);
      map.setPaintProperty(layer.id, 'fill-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, '#b9ddbf',
        LAND_DETAIL_ZOOM_END,
        ['match', ['get', 'class'],
          'residential', '#e8b17b',
          'commercial', '#e7c59e',
          'industrial', '#d8d4ce',
          'retail', '#e3a97b',
          'pitch', '#b8dda0',
          'track', '#e2d2a1',
          'cemetery', '#c7dfa9',
          'hospital', '#ecd4dc',
          'school', '#eee4b4',
          '#b9ddbf']
      ]);
      map.setPaintProperty(layer.id, 'fill-opacity', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, layer.paint?.['fill-opacity'] ?? 1,
        LAND_DETAIL_ZOOM_END, 0.88
      ]);
    } else if (sourceLayer === 'building' && layer.type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', '#74736f');
      map.setPaintProperty(layer.id, 'fill-outline-color', '#f7f2e7');
    } else if (sourceLayer === 'building' && layer.type === 'fill-extrusion') {
      map.setPaintProperty(layer.id, 'fill-extrusion-color', '#74736f');
      map.setPaintProperty(layer.id, 'fill-extrusion-opacity', 0.88);
    } else if (sourceLayer === 'transportation' && layer.type === 'line') {
      map.setLayerZoomRange(layer.id, Math.min(layer.minzoom ?? 0, 7), layer.maxzoom ?? 24);
      const isCasing = layerId.includes('casing');
      const isMainRoad = ['motorway', 'trunk', 'primary', 'secondary'].some(roadClass => layerId.includes(roadClass));
      const isMinorRoad = ['minor', 'street'].some(roadClass => layerId.includes(roadClass));
      map.setPaintProperty(layer.id, 'line-color', transportationLineColorExpression(layerId));
      map.setPaintProperty(layer.id, 'line-width', transportationLineWidthExpression(layerId));
      map.setPaintProperty(
        layer.id,
        'line-opacity',
        isMinorRoad ? (isCasing ? 0.95 : 0.98) : isMainRoad || isCasing ? 0.9 : 0.72
      );
    }

    if (layer.type === 'symbol' && layer.layout?.['text-field'] && !layer.layout?.['icon-image']
      && !isNamedRoadLabel && !isPathNameLabel && !isPoiNameLabel) {
      map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(255,255,255,0.95)');
      map.setPaintProperty(layer.id, 'text-halo-width', 1.7);
      map.setPaintProperty(layer.id, 'text-halo-blur', 0.25);
    }
  });

}

function addComplementaryLandcover(map, tuning) {
  if (!COMPLEMENTARY_LANDCOVER_ENABLED) return;

  if (!map.getSource('complementary-landcover')) {
    const archiveUrl = new URL(`/data/tiles/${TERRAIN_LANDCOVER.archive}`, window.location.origin);
    map.addSource('complementary-landcover', {
      type: 'vector',
      url: `pmtiles://${archiveUrl.href}`,
      attribution: TERRAIN_LANDCOVER.attribution
    });
  }
  if (!map.getSource('complementary-urban')) {
    const archiveUrl = new URL(`/data/tiles/${DEFAULT_URBAN_LANDCOVER.archive}`, window.location.origin);
    map.addSource('complementary-urban', {
      type: 'vector',
      url: `pmtiles://${archiveUrl.href}`,
      attribution: DEFAULT_URBAN_LANDCOVER.attribution
    });
  }
  if (map.getLayer('complementary-landcover-fill')) return;

  const beforeLayer = map.getStyle().layers.find(layer => (
    layer['source-layer'] === 'building' || layer['source-layer'] === 'transportation'
  ))?.id;
  map.addLayer({
    id: 'complementary-landcover-fill',
    type: 'fill',
    source: 'complementary-landcover',
    'source-layer': 'landcover',
    minzoom: LAND_DETAIL_ZOOM_START,
    layout: { visibility: 'none' },
    paint: {
      'fill-color': complementaryLandcoverColorExpression(tuning),
      'fill-opacity': complementaryLandcoverOpacityExpression(tuning)
    }
  }, beforeLayer);
  map.addLayer({
    id: 'complementary-urban-fill',
    type: 'fill',
    source: 'complementary-urban',
    'source-layer': 'landcover',
    minzoom: SIMPLE_DEVELOPED_AREA_FADE_IN_ZOOM_START,
    filter: ['==', ['get', 'class'], 'urban'],
    layout: { visibility: 'none' },
    paint: {
      'fill-color': tuning.urban.color,
      'fill-opacity': simplifiedDevelopedAreaOpacityExpression(tuning)
    }
  }, beforeLayer);
}

function addComplementaryForest(map, tuning) {
  if (!COMPLEMENTARY_FOREST_ENABLED) return;

  if (!map.getSource('complementary-forest')) {
    const archiveUrl = new URL(`/data/tiles/${COMPLEMENTARY_FOREST.archive}`, window.location.origin);
    map.addSource('complementary-forest', {
      type: 'vector',
      url: `pmtiles://${archiveUrl.href}`,
      attribution: COMPLEMENTARY_FOREST.attribution
    });
  }
  if (map.getLayer('complementary-forest-fill')) return;

  const beforeLayer = map.getStyle().layers.find(layer => (
    layer['source-layer'] === 'building' || layer['source-layer'] === 'transportation'
  ))?.id;
  map.addLayer({
    id: 'complementary-forest-fill',
    type: 'fill',
    source: 'complementary-forest',
    'source-layer': 'landcover',
    minzoom: LAND_DETAIL_ZOOM_START,
    paint: {
      'fill-color': tuning.forest.color,
      'fill-opacity': landcoverFadeExpression(tuning.forest.opacity)
    }
  }, beforeLayer);
}

function applyLandcoverTuning(map, tuning) {
  if (map.getLayer('complementary-forest-fill')) {
    map.setPaintProperty('complementary-forest-fill', 'fill-color', tuning.forest.color);
    map.setPaintProperty(
      'complementary-forest-fill',
      'fill-opacity',
      landcoverFadeExpression(tuning.forest.opacity)
    );
  }
  if (map.getLayer('complementary-landcover-fill')) {
    map.setPaintProperty(
      'complementary-landcover-fill',
      'fill-color',
      complementaryLandcoverColorExpression(tuning)
    );
    map.setPaintProperty(
      'complementary-landcover-fill',
      'fill-opacity',
      complementaryLandcoverOpacityExpression(tuning)
    );
  }

  map.getStyle().layers.forEach(layer => {
    if (layer.source !== 'openmaptiles' || layer.type !== 'fill') return;
    const sourceLayer = layer['source-layer'];
    if (sourceLayer === 'landcover') {
      map.setPaintProperty(layer.id, 'fill-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, '#addbb9',
        LAND_DETAIL_ZOOM_END,
        ['match', ['get', 'class'],
          'wood', tuning.forest.color,
          'grass', tuning.open.color,
          'farmland', tuning.farmland.color,
          'rock', tuning.rock.color,
          'wetland', tuning.wetland.color,
          'sand', tuning.sand.color,
          'bare', tuning.bare.color,
          'ice', tuning.ice.color,
          '#addbb9']
      ]);
      const overviewOpacity = openFreeMapOverviewOpacities.get(map)?.get(layer.id) ?? 1;
      map.setPaintProperty(
        layer.id,
        'fill-opacity',
        openFreeMapLandcoverOpacityExpression(tuning, overviewOpacity)
      );
    } else if (sourceLayer === 'landuse') {
      map.setPaintProperty(layer.id, 'fill-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, '#b9ddbf',
        LAND_DETAIL_ZOOM_END,
        ['match', ['get', 'class'],
          ['residential', 'commercial', 'industrial', 'retail'], tuning.urban.color,
          'pitch', '#b8dda0',
          'track', '#e2d2a1',
          'cemetery', '#c7dfa9',
          'hospital', '#ecd4dc',
          'school', '#eee4b4',
          '#b9ddbf']
      ]);
      const overviewOpacity = openFreeMapOverviewOpacities.get(map)?.get(layer.id) ?? 1;
      map.setPaintProperty(
        layer.id,
        'fill-opacity',
        openFreeMapLanduseOpacityExpression(tuning, overviewOpacity)
      );
    } else if (sourceLayer === 'park') {
      map.setPaintProperty(layer.id, 'fill-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, '#d8e8c8',
        LAND_DETAIL_ZOOM_END, tuning.park.color
      ]);
      map.setPaintProperty(layer.id, 'fill-opacity', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, 0.7 * tuning.park.opacity,
        LANDCOVER_OPACITY_CAP_ZOOM,
        cappedOpacity(0.7 * tuning.park.opacity, 0.85 * tuning.park.opacity)
      ]);
    }
  });
}

function setComplementaryLandcoverVisibility(map, mapTypeId, landcoverVisible) {
  const terrainVisible = mapTypeId === 'openfreemapTerrain' && landcoverVisible;
  ['complementary-forest-fill', 'complementary-landcover-fill'].forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', terrainVisible ? 'visible' : 'none');
    }
  });
  if (map.getLayer('complementary-urban-fill')) {
    map.setLayoutProperty(
      'complementary-urban-fill',
      'visibility',
      mapTypeId === 'openfreemap' ? 'visible' : 'none'
    );
  }
}

function applyOpenFreeMapAppearance(map, mapTypeId, tuning) {
  const style = map.getStyle();
  if (!style?.layers) return;
  const terrain = mapTypeId === 'openfreemapTerrain';
  style.layers.forEach(layer => {
    const sourceLayer = layer['source-layer'];

    if (layer.type === 'background') {
      map.setPaintProperty(layer.id, 'background-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, SIMPLE_LAND_COLOR,
        LAND_DETAIL_ZOOM_END, terrain ? '#e9e8cf' : SIMPLE_LAND_DETAIL_COLOR
      ]);
    } else if (sourceLayer === 'water' && layer.type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, SIMPLE_WATER_COLOR,
        LAND_DETAIL_ZOOM_END, '#ffffff'
      ]);
    } else if (sourceLayer === 'waterway' && layer.type === 'line') {
      map.setPaintProperty(layer.id, 'line-color', terrain ? [
        'interpolate', ['linear'], ['zoom'],
        LAND_DETAIL_ZOOM_START, '#dce7f3',
        LAND_DETAIL_ZOOM_END, '#61bfe5'
      ] : '#dce7f3');
    } else if (sourceLayer === 'transportation' && layer.type === 'line') {
      const simplified = !terrain;
      const layerId = layer.id.toLowerCase();
      map.setPaintProperty(
        layer.id,
        'line-color',
        transportationLineColorExpression(layerId, simplified)
      );
      map.setPaintProperty(layer.id, 'line-width', transportationLineWidthExpression(layerId, simplified));
    }

    if (sourceLayer === 'landcover' || sourceLayer === 'park') {
      map.setLayoutProperty(layer.id, 'visibility', terrain ? 'visible' : 'none');
    }
  });

  if (terrain) {
    applyLandcoverTuning(map, tuning);
    return;
  }

  const complementaryUrbanAvailable = Boolean(map.getLayer('complementary-urban-fill'));
  if (complementaryUrbanAvailable) {
    map.setPaintProperty('complementary-urban-fill', 'fill-color', tuning.urban.color);
    map.setPaintProperty(
      'complementary-urban-fill',
      'fill-opacity',
      simplifiedDevelopedAreaOpacityExpression(tuning)
    );
  }
  style.layers.forEach(layer => {
    if (layer.source !== 'openmaptiles' || layer.type !== 'fill' || layer['source-layer'] !== 'landuse') return;
    const overviewOpacity = openFreeMapOverviewOpacities.get(map)?.get(layer.id) ?? 1;
    map.setPaintProperty(layer.id, 'fill-color', tuning.urban.color);
    map.setPaintProperty(
      layer.id,
      'fill-opacity',
      complementaryUrbanAvailable
        ? 0
        : simplifiedDevelopedLanduseOpacityExpression(tuning, overviewOpacity)
    );
  });
}

function addRasterBaseMaps(map) {
  if (!map.getSource('osm-raster')) map.addSource('osm-raster', {
    type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19,
    attribution: '© OpenStreetMap contributors'
  });
  if (!map.getLayer('base-osm')) map.addLayer({ id: 'base-osm', type: 'raster', source: 'osm-raster', layout: { visibility: 'none' } });
}

function setBaseMap(map, mapTypeId, tuning, landcoverVisible) {
  Object.entries(RASTER_BASE_LAYERS).forEach(([type, layerId]) => {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', mapTypeId === type ? 'visible' : 'none');
  });
  applyOpenFreeMapAppearance(map, mapTypeId, tuning);
  setComplementaryLandcoverVisibility(map, mapTypeId, landcoverVisible);
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

function vesselHullGeometry(feature) {
  const properties = feature.properties || {};
  const vessel = properties.vessel || {};
  const dimensions = ['referencePointA', 'referencePointB', 'referencePointC', 'referencePointD']
    .map(key => Number(vessel[key]));
  const [bow, stern, port, starboard] = dimensions;
  const coordinates = feature.geometry?.coordinates;
  const heading = Number(properties.heading);
  const course = Number(properties.cog);
  const direction = heading >= 0 && heading < 360 ? heading : course >= 0 && course < 360 ? course : null;
  if (!Array.isArray(coordinates) || coordinates.length < 2 ||
      dimensions.some(value => !Number.isFinite(value) || value <= 0) || direction === null) return null;

  const [longitude, latitude] = coordinates;
  const radians = direction * Math.PI / 180;
  const longitudeMetres = 111320 * Math.cos(latitude * Math.PI / 180);
  const point = (forward, right) => [
    longitude + (forward * Math.sin(radians) + right * Math.cos(radians)) / longitudeMetres,
    latitude + (forward * Math.cos(radians) - right * Math.sin(radians)) / 111320
  ];
  const length = bow + stern;
  const width = port + starboard;
  const centreline = (starboard - port) / 2;
  const shoulder = Math.max(-stern, bow - Math.min(length * 0.2, width * 1.5));

  return {
    polygon: [[
      point(bow, centreline),
      point(shoulder, starboard),
      point(-stern, starboard),
      point(-stern, -port),
      point(shoulder, -port),
      point(bow, centreline)
    ]]
  };
}

function vesselHullFeature(feature, hull) {
  if (!hull) return null;
  return {
    type: 'Feature',
    properties: {
      mmsi: feature.properties.mmsi,
      known: feature.properties.known,
      opacity: feature.properties.opacity
    },
    geometry: { type: 'Polygon', coordinates: hull.polygon }
  };
}

const emptyFeatureCollection = () => ({ type: 'FeatureCollection', features: [] });

const routeTypePriority = subtype => {
  if (subtype === 'cableferry') return 0;
  if (['conn1', 'conn1b'].includes(subtype)) return 1;
  if (['conn2', 'conn2m', 'conn2b'].includes(subtype)) return 2;
  if (subtype === 'conn3') return 3;
  if (subtype === 'conn4') return 4;
  if (['conn5', 'conn50'].includes(subtype)) return 5;
  if (subtype === 'longdistance') return 6;
  return 3;
};

function lineLength(coordinates = []) {
  return coordinates.slice(1).reduce((length, coordinate, index) => {
    const previous = coordinates[index];
    const latitude = (previous[1] + coordinate[1]) * Math.PI / 360;
    const dx = (coordinate[0] - previous[0]) * Math.cos(latitude);
    const dy = coordinate[1] - previous[1];
    return length + Math.hypot(dx, dy);
  }, 0);
}

function prioritizeRouteFeatures(features) {
  return [...features].sort((a, b) => {
    const typeDifference = routeTypePriority(a.properties.subtype) - routeTypePriority(b.properties.subtype);
    if (typeDifference) return typeDifference;
    return (Number(a.properties.routeLength) || Infinity) - (Number(b.properties.routeLength) || Infinity);
  });
}

function raiseLiveLayers(map) {
  ['live-history', 'live-vessel-hulls', 'live-vessel-hull-outlines', 'live-vessels', 'live-vessel-labels'].forEach(id => {
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
  const routeLengths = new Map();
  features.filter(feature => feature.properties.kind === 'route').forEach(feature => {
    routeLengths.set(feature.properties.ref, (routeLengths.get(feature.properties.ref) || 0) + lineLength(feature.geometry.coordinates));
  });
  features.filter(feature => feature.properties.kind === 'route').forEach(feature => {
    feature.properties.routeLength = routeLengths.get(feature.properties.ref);
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

function updateDistanceSignMarkers(map, markers, visible) {
  if (!map) return;
  const zoom = map.getZoom();
  const fontSize = distanceSignTextSize(zoom);
  markers.forEach(({ element, minZoom, maxZoom }) => {
    element.style.display = visible && zoom >= minZoom && zoom < maxZoom ? '' : 'none';
    element.style.fontSize = `${fontSize}px`;
  });
}

function createDistanceSignMarkers(map, sourceData) {
  return sourceData.features.filter(feature => feature.properties.kind === 'box').map(feature => {
    const element = document.createElement('div');
    element.className = 'distance-sign-marker';
    const label = document.createElement('div');
    label.className = 'distance-sign-marker__label';
    label.textContent = feature.properties.description;
    label.style.setProperty('--distance-sign-offset-x', `${feature.properties.labelOffset[0]}em`);
    label.style.setProperty('--distance-sign-offset-y', `${feature.properties.labelOffset[1]}em`);
    element.appendChild(label);
    const marker = new maplibregl.Marker({
      element,
      anchor: feature.properties.labelTextAnchor
    }).setLngLat(feature.geometry.coordinates.slice(0, 2)).addTo(map);
    return {
      element,
      marker,
      minZoom: feature.properties.objectMinZoom,
      maxZoom: Math.min(feature.properties.objectMaxZoom + 1, DISTANCE_SIGN_MAX_ZOOM)
    };
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
  const distanceSignMarkersRef = useRef([]);
  const stopLocationTrackingRef = useRef(() => {});
  const mapTypeRef = useRef(mapTypeId);
  const layersRef = useRef(layers);
  const landcoverVisibleRef = useRef(true);
  const landcoverTuningRef = useRef(null);
  layersRef.current = layers;
  const [status, setStatus] = useState('Ladataan karttaa…');
  const [selection, setSelection] = useState(null);
  const [mapDebug, setMapDebug] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [landcoverVisible, setLandcoverVisible] = useState(true);
  const [landcoverTuning, setLandcoverTuning] = useState(loadLandcoverTuning);
  landcoverTuningRef.current = landcoverTuning;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return undefined;
    if (SCREENSHOT_MAP_VIEW) document.getElementById('loader')?.style.setProperty('display', 'none');
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: OPENFREEMAP_STYLE,
      center: SCREENSHOT_MAP_VIEW?.center || [21.25, 60.15],
      zoom: SCREENSHOT_MAP_VIEW?.zoom || MIN_ROUTE_RENDER_ZOOM,
      minZoom: 4,
      maxZoom: 17,
      attributionControl: false
    });
    mapRef.current = map;
    map.once('load', () => {
      window.requestAnimationFrame(() => {
        map.resize();
        if (!SCREENSHOT_MAP_VIEW) fitRouteArea(map);
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
      addComplementaryForest(map, landcoverTuningRef.current);
      addComplementaryLandcover(map, landcoverTuningRef.current);
      addRasterBaseMaps(map);
      setBaseMap(map, mapTypeRef.current, landcoverTuningRef.current, landcoverVisibleRef.current);
      addArchipelagoTarget(map);
      collapseAttribution();
      updateMapDebug();
      updateResetVisibility();
      ensureLocationLayers();
      showLatestPosition();
      setStatus('Kartta valmis');
      revealMap = () => {
        if (!map.getSource('saaristolautat')) {
          map.once('idle', revealMap);
          return;
        }
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

    const removeDistanceSigns = () => {
      distanceSignMarkersRef.current.forEach(({ marker }) => marker.remove());
      distanceSignMarkersRef.current = [];
    };
    const updateDistanceSigns = () => updateDistanceSignMarkers(
      map,
      distanceSignMarkersRef.current,
      layersRef.current.distances
    );
    const rebuildDistanceSigns = () => {
      removeDistanceSigns();
      distanceSignMarkersRef.current = createDistanceSignMarkers(map, sourceData);
      updateDistanceSigns();
    };

    function addLayers() {
      rebuildDistanceSigns();
      if (map.getSource('saaristolautat')) {
        map.getSource('saaristolautat').setData(sourceData);
        applyLayerSettings(map, layersRef.current);
        raiseLiveLayers(map);
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
        filter: roadFerryRouteFilter, minzoom: 6,
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
          const allHoveredFeatures = prioritizeRouteFeatures(map.queryRenderedFeatures(event.point, { layers: routeLayers }));
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
        const allClickedFeatures = prioritizeRouteFeatures(map.queryRenderedFeatures(event.point, { layers: routeLayers }));
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

    const ensureLayers = () => {
      if (!map.getSource('saaristolautat') && map.isStyleLoaded()) addLayers();
    };
    map.on('styledata', ensureLayers);
    map.on('idle', ensureLayers);
    map.on('zoom', updateDistanceSigns);
    if (map.isStyleLoaded()) addLayers();
    else map.once('load', addLayers);
    return () => {
      map.off('styledata', ensureLayers);
      map.off('idle', ensureLayers);
      map.off('load', addLayers);
      map.off('zoom', updateDistanceSigns);
      removeDistanceSigns();
    };
  }, [data, dispatch, geojson, locale]);

  useEffect(() => {
    applyLayerSettings(mapRef.current, layers);
    updateDistanceSignMarkers(mapRef.current, distanceSignMarkersRef.current, layers.distances);
  }, [layers]);

  useEffect(() => {
    landcoverVisibleRef.current = landcoverVisible;
    const map = mapRef.current;
    if (map) setComplementaryLandcoverVisibility(
      map,
      mapTypeRef.current,
      landcoverVisible
    );
  }, [landcoverVisible]);

  useEffect(() => {
    landcoverTuningRef.current = landcoverTuning;
    if (SHOW_MAP_DEBUG) {
      window.localStorage.setItem(LANDCOVER_TUNING_STORAGE_KEY, JSON.stringify(landcoverTuning));
    }
    const map = mapRef.current;
    if (map?.isStyleLoaded()) {
      applyOpenFreeMapAppearance(map, mapTypeRef.current, landcoverTuning);
    }
  }, [landcoverTuning]);

  useEffect(() => {
    mapTypeRef.current = mapTypeId;
    const map = mapRef.current;
    if (map) setBaseMap(map, mapTypeId, landcoverTuningRef.current, landcoverVisibleRef.current);
  }, [mapTypeId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    let interval;
    let dimmingTimeout;
    let cancelled = false;
    const knownVesselNames = knownVesselNamesByMmsi(data);

    const ensureLiveLayers = () => {
      if (!map.getStyle()?.layers?.length) return false;
      addLiveVesselImages(map);
      if (!map.getSource('live-history')) map.addSource('live-history', { type: 'geojson', data: emptyFeatureCollection() });
      if (!map.getSource('live-vessel-hulls')) map.addSource('live-vessel-hulls', { type: 'geojson', data: emptyFeatureCollection() });
      if (!map.getSource('live-vessels')) map.addSource('live-vessels', { type: 'geojson', data: emptyFeatureCollection() });
      if (!map.getLayer('live-history')) map.addLayer({
        id: 'live-history', type: 'line', source: 'live-history', minzoom: legacyZoomToMapLibre(8),
        paint: { 'line-color': '#a0a0a0', 'line-width': 0.5, 'line-opacity': 0.7 }
      });
      if (!map.getLayer('live-vessel-hulls')) map.addLayer({
        id: 'live-vessel-hulls', type: 'fill', source: 'live-vessel-hulls', minzoom: 12,
        layout: { 'fill-sort-key': ['case', ['get', 'known'], 1, 0] },
        paint: {
          'fill-color': ['interpolate', ['linear'], ['zoom'], 14, '#a030ff', 17, '#e2c6ff'],
          'fill-opacity': ['interpolate', ['linear'], ['zoom'],
            12, 0,
            14, ['*', ['get', 'opacity'], 0.7],
            17, ['*', ['get', 'opacity'], 0.22]
          ]
        }
      });
      if (!map.getLayer('live-vessel-hull-outlines')) map.addLayer({
        id: 'live-vessel-hull-outlines', type: 'line', source: 'live-vessel-hulls', minzoom: 12,
        layout: { 'line-sort-key': ['case', ['get', 'known'], 1, 0] },
        paint: {
          'line-color': ['interpolate', ['linear'], ['zoom'], 14, '#a030ff', 17, '#c58cf7'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 16, 1.5],
          'line-opacity': ['interpolate', ['linear'], ['zoom'],
            12, 0,
            14, ['*', ['get', 'opacity'], 0.9],
            17, ['*', ['get', 'opacity'], 0.55]
          ]
        }
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
          'symbol-sort-key': ['case', ['get', 'known'], 1, 0],
          'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true
        },
        paint: {
          'icon-opacity': ['step', ['zoom'], ['get', 'opacity'], 14,
            ['case', ['get', 'hasHull'], 0, ['get', 'opacity']]
          ]
        }
      });
      if (!map.getLayer('live-vessel-labels')) map.addLayer({
        id: 'live-vessel-labels', type: 'symbol', source: 'live-vessels', minzoom: legacyZoomToMapLibre(9),
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'],
            12, ['case', ['get', 'known'], ['case', ['>', ['get', 'sog'], 0.1], 12, 9], ['case', ['>', ['get', 'sog'], 0.1], 10, 8]],
            14, ['case', ['get', 'known'], ['case', ['>', ['get', 'sog'], 0.1], 13, 10], ['case', ['>', ['get', 'sog'], 0.1], 11, 9]],
            16, ['case', ['get', 'known'], ['case', ['>', ['get', 'sog'], 0.1], 15, 12], ['case', ['>', ['get', 'sog'], 0.1], 13, 11]]
          ],
          'text-offset': ['case', ['>', ['get', 'sog'], 0.1], ['literal', [-0.35, -0.35]], ['literal', [-0.2, -0.2]]],
          'text-anchor': 'bottom-right',
          'symbol-sort-key': ['case', ['get', 'known'], 1, 0],
          'text-allow-overlap': true, 'text-ignore-placement': true
        },
        paint: { 'text-color': '#880078', 'text-halo-color': 'rgba(255,255,255,0.9)', 'text-halo-width': 1 }
      });
      raiseLiveLayers(map);
      return true;
    };

    const clearLiveData = () => {
      map.getSource('live-vessels')?.setData(emptyFeatureCollection());
      map.getSource('live-vessel-hulls')?.setData(emptyFeatureCollection());
      map.getSource('live-history')?.setData(emptyFeatureCollection());
      liveFeaturesRef.current = [];
      dispatch({ type: 'UPDATE_INDICATOR_MSG', payload: '' });
    };

    const loadLiveData = async () => {
      try {
        const cacheBust = Date.now();
        const fetchOptions = { cache: 'no-store' };
        const [vesselsResponse, historyResponse] = await Promise.all([
          fetch(`/live/livedata.json?t=${cacheBust}`, fetchOptions),
          fetch(`/live/livehistory.json?t=${cacheBust}`, fetchOptions)
        ]);
        if (!vesselsResponse.ok || !historyResponse.ok) throw new Error('Live data request failed');
        const [vessels, history] = await Promise.all([vesselsResponse.json(), historyResponse.json()]);
        if (cancelled || !ensureLiveLayers()) return;
        const now = Date.now();
        const features = (vessels.features || []).map(feature => {
          const age = Math.max(0, now - Number(feature.properties?.timestampExternal || 0)) / 1000;
          const liveVessel = feature.properties?.vessel || {};
          const mmsi = Number(feature.properties?.mmsi ?? liveVessel.mmsi ?? feature.mmsi);
          const known = knownVesselNames.has(mmsi);
          const name = knownVesselNames.get(mmsi) || liveVessel.name || '';
          return {
            ...feature,
            properties: {
              ...feature.properties,
              vessel: { ...liveVessel, name },
              name, known, age,
              opacity: Math.max(0.3, 1 - 0.7 * Math.max(0, age - 180) / 600)
            }
          };
        }).filter(feature => feature.properties.age < 600);
        const rendered = features.map(feature => ({ feature, hull: vesselHullGeometry(feature) }));
        const displayedFeatures = rendered.map(({ feature, hull }) => ({
          ...feature,
          properties: { ...feature.properties, hasHull: Boolean(hull) }
        }));
        liveFeaturesRef.current = displayedFeatures;
        map.getSource('live-vessels').setData({ type: 'FeatureCollection', features: displayedFeatures });
        map.getSource('live-vessel-hulls').setData({
          type: 'FeatureCollection',
          features: rendered.map(({ feature, hull }) => vesselHullFeature(feature, hull)).filter(Boolean)
        });
        map.getSource('live-history').setData(history);
        updateLiveIndicator(map, displayedFeatures, dispatch);
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
  }, [data, dispatch, layers.live]);

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

  const terrainMapSelected = mapTypeId === 'openfreemapTerrain';
  const landcoverToggle = terrainMapSelected && SHOW_MAP_DEBUG && COMPLEMENTARY_LANDCOVER_ENABLED && (
    <button
      type="button"
      className={`landcover-toggle ${landcoverVisible ? 'active' : ''}`}
      aria-pressed={landcoverVisible}
      onClick={() => setLandcoverVisible(visible => !visible)}
    >
      Täydentävä maanpeite ({TERRAIN_LANDCOVER.label})
    </button>
  );

  const landcoverTuningPanel = terrainMapSelected && SHOW_MAP_DEBUG && COMPLEMENTARY_LANDCOVER_ENABLED && (
    <details className="landcover-tuning">
      <summary>Maanpeitevärien säätö</summary>
      <div className="landcover-tuning__head" aria-hidden="true">
        <span>Luokka</span><span>Väri</span><span>Peittävyys</span><span />
      </div>
      {Object.entries(LANDCOVER_TUNING_DEFAULTS).map(([className, defaults]) => {
        const setting = landcoverTuning[className];
        return (
          <div className="landcover-tuning__row" key={className}>
            <span>{defaults.label}</span>
            <input
              type="color"
              value={setting.color}
              aria-label={`${defaults.label}: väri`}
              onChange={event => setLandcoverTuning(current => ({
                ...current,
                [className]: { ...current[className], color: event.target.value }
              }))}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={setting.opacity}
              aria-label={`${defaults.label}: peittävyys`}
              onChange={event => setLandcoverTuning(current => ({
                ...current,
                [className]: { ...current[className], opacity: Number(event.target.value) }
              }))}
            />
            <output>{Math.round(setting.opacity * 100)}%</output>
          </div>
        );
      })}
      <button type="button" onClick={() => setLandcoverTuning(defaultLandcoverTuning())}>
        Palauta oletukset
      </button>
    </details>
  );

  if (embedded) return (
    <>
      <div ref={mapContainer} id="map" className={`map maplibre-embedded ${mapReady ? 'maplibre-map-ready' : 'maplibre-map-loading'}`} aria-label="Saaristolauttojen kartta" />
      {resetButton}
      {landcoverToggle}
      {landcoverTuningPanel}
      {debugElement}
    </>
  );

  return (
    <main className="map-view">
      <div ref={mapContainer} className={`map-view__canvas ${mapReady ? 'maplibre-map-ready' : 'maplibre-map-loading'}`} aria-label="Saaristolauttojen kartta" />
      {resetButton}
      {landcoverToggle}
      {landcoverTuningPanel}
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
