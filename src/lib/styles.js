
const defaultRoadStrokeColor = '#8a7d6a';
const satelliteRoadStrokeColor = '#c0c0c0';
const defaultRoadFillColor = '#8a7d6a';
const satelliteRoadFillColor = '#c0c0c0';

const roadStrokeColorMap = { satellite: satelliteRoadStrokeColor, default: defaultRoadStrokeColor };
const roadFillColorMap = { satellite: satelliteRoadFillColor, default: defaultRoadFillColor };

const getRoadStrokeColor = (mapTypeId) => roadStrokeColorMap[mapTypeId] || roadStrokeColorMap.default;
const getRoadFillColor = (mapTypeId) => roadFillColorMap[mapTypeId] || roadFillColorMap.default;

// Define a symbol using SVG path notation, with an opacity of 1.
const borderLineSymbol = {
  path: 'M 0,-4 0,0',
  strokeOpacity: 0.4,
  strokeColor: '#808080',
  scale: 1
};


const styles = {
  road: {
    init: {
      strokeColor: defaultRoadStrokeColor,
      fillColor: defaultRoadFillColor,
      strokeOpacity: 1,
      strokeWeight: 1,
      zIndex: 0
    },
    update: (zoom, mapTypeId) => ({
      strokeColor: getRoadStrokeColor(mapTypeId)
    })
  },
  route: {
    init: {
      strokeColor: '#202020',
      strokeOpacity: 0.4,
      strokeWeight: 1,
      zIndex: 0,
      cursor: 'context-menu',
    },
    update: (zoom, mapTypeId) => ({
      strokeWeight: (zoom <= 8 ? 2 : zoom <= 9 ? 2.5 : 3)
    })
  },
  border: {
    init: {
      zIndex: 0,
      strokeOpacity: 0,
      icons: [{
        icon: {
          path: 'M 0,-4 0,0',
          strokeOpacity: 0.4,
          strokeColor: '#808080',
          scale: 1
        },
        offset: '0',
        repeat: '8px'
      }]
    },
    update: (zoom, mapTypeId) => ({})
  }
};

export default styles;

export function getMapStyle(mapTypeId, zoom) {
  return [
    // forests visible
    {
      featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [
        { lightness: -15 },
        { saturation: -50 },
        { hue: '#00ff3b' },
        { gamma: 1.2 }
      ]
    },
    // flat style
    // { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{color: '#b8cbb8'}, {lightness: 20} ]},

    { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#edf3ff' }, { lightness: 40 }] },

    { elementType: 'labels', stylers: [{ "visibility": "off" }] },
    { featureType: 'administrative', elementType: 'labels', stylers: [{ "visibility": zoom <= 7 || zoom >= 13 ? 'on' : 'off' }] },
    { featureType: 'landscape', elementType: 'labels', stylers: [{ "visibility": zoom >= 13 ? 'on' : 'off' }] },
    { featureType: 'poi', elementType: 'labels', stylers: [{ "visibility": zoom >= 10 ? 'on' : 'off' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ saturation: -10 }] },

    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#400040' }, { weight: 1 }] },
    { featureType: 'transit', stylers: [{ "visibility": "off" }] },

    { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'on' }] },
    { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 3 }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#000000' }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: getRoadFillColor(mapTypeId) }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: getRoadStrokeColor(mapTypeId) }] },
    { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ visibility: "simplified" }, { weight: zoom <= 7 ? 0.5 : Math.max(0.6, 0.6 + (zoom - 7) * 0.4) }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ visibility: "simplified" }, { weight: 0.1 }] },
    { featureType: 'road.highway.controlled_access', elementType: 'geometry.fill', stylers: [{ visibility: "simplified" }, { weight: zoom <= 6 ? 0.7 : Math.max(0.8, 0.8 + (zoom - 6) * 0.55) }] },
    { featureType: 'road.highway.controlled_access', elementType: 'geometry.stroke', stylers: [{ visibility: "simplified" }, { weight: 0.2 }] },
    { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ visiblity: "simplified" }, { weight: Math.max(0.8, 0.8 + (zoom - 9) * 0.3) }] },
    { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{ visiblity: "simplified" }, { weight: 0.1 }] },
    { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ visiblity: "simplified" }, { weight: 0.8 }] },
    { featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{ visiblity: "simplified" }, { weight: 0.1 }] }
  ];
}
