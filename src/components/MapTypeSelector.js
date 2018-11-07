import React, { Component } from 'react';
import { L2 } from '../lib/localizer';
import { connect } from 'react-redux';
import { selectMapType } from '../actions/settingsActions';

class MapTypeSelector extends Component {

    mapTypes = ["roadmap", "satellite", "hybrid", "terrain", "OSM", "MMLTAUSTA", "MMLMAASTO"];

    onChange(event) {
        this.props.dispatch(selectMapType(this.mapTypes[event.target.selectedIndex]));
    }

    render() {
        const options = this.mapTypes.map(mapType =>
            <option key={mapType} value={mapType}>{L2("mapTypes." + mapType)} </option>
        );
        return (
            <div className="MapTypeSelector" >
                <select className="mapTypeSelect" value={this.props.mapTypeId} onChange={this.onChange.bind(this)}>{options}</select>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        locale: state.settings.locale,
        mapTypeId: state.settings.mapTypeId
    };
};

export default connect(mapStateToProps)(MapTypeSelector);
