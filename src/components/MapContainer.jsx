import React from 'react';
import MapLibreMap from './MapLibreMap';

export default function MapContainer() {
  return (
    <div id="mapcontainer">
      <MapLibreMap embedded />
    </div>
  );
}
