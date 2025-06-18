import React, { Component } from 'react';
import MapInfo from './MapInfo';

export default class MapContainer extends Component {
    render() {
        return (
            <div id="mapcontainer">
                <div id="map" className="map hide"></div>
                <MapInfo/>
            </div>
        );
    }
}
