import React, { Component } from 'react';
import { L2 } from '../lib/localizer';
import { connect } from 'react-redux';

class MapTypeSelector extends Component {

    mapTypes = ["roadmap", "satellite", "hybrid", "terrain", "OSM", "MMLTAUSTA", "MMLMAASTO"];

    render() {
        const options = this.mapTypes.map(mapType =>
            <option key={mapType} value={mapType}>{L2("mapTypes." + mapType)} </option>
        );
        return (
            <div className="MapTypeSelector" >
                <select className="mapTypeSelect">{options}</select>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        locale: state.settings.locale
    };
};

export default connect(mapStateToProps)(MapTypeSelector);
