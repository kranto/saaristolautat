import React, { Component } from 'react';
import { L2 } from '../lib/localizer';
import { connect } from 'react-redux';
import { selectMapType, setTerrainOverlay } from '../actions/settingsActions';

class MapTypeSelector extends Component {
    constructor(props) {
        super(props);
        this.state = { open: false, hasOpened: props.settingsOpen }
    }

    mapTypes = ["openfreemap", "openfreemapTerrain", "OSM"];

    previewImages = {
        openfreemap: "/img/openfreemap.png?v=1",
        openfreemapTerrain: "/img/openfreemap-terrain-options.png?v=1",
        OSM: "/img/OSM.png?v=1"
    };

    componentDidUpdate(previousProps) {
        const nextState = {};
        if (!previousProps.settingsOpen && this.props.settingsOpen && !this.state.hasOpened) {
            nextState.hasOpened = true;
        }
        if (previousProps.settingsOpen && !this.props.settingsOpen && this.state.open) {
            nextState.open = false;
        }
        if (Object.keys(nextState).length) {
            this.setState(nextState);
        }
    }

    onClick(event) {
        if (this.state.open) {
            const clicked = event.target.getAttribute("data-target");
            if (this.props.mapTypeId === clicked) {
                this.setState({ open: false });
            } else {
                this.props.dispatch(selectMapType(clicked));
            }
        } else {
            this.setState({ open: true });
        }
    }

    onTerrainOverlayChange(overlay, event) {
        if (this.props.mapTypeId !== "openfreemapTerrain") {
            this.props.dispatch(selectMapType("openfreemapTerrain"));
        }
        this.props.dispatch(setTerrainOverlay(overlay, event.target.checked));
    }

    render() {
        if (!this.props.settingsOpen && !this.state.hasOpened) {
            return "";
        }

        const options = this.mapTypes.map(mapType => {
            const terrainOption = mapType === "openfreemapTerrain";
            const classes = "mapSelectOption" +
                (terrainOption ? " mapSelectOption--terrain" : "") +
                (this.props.mapTypeId === mapType ? " selected" : "");
            return (
                <div
                    key={mapType}
                    data-target={mapType}
                    onClick={this.onClick.bind(this)}
                    className={classes}
                    style={{ backgroundImage: `url(${this.previewImages[mapType]})` }}
                >
                    <div className="mapSelectOption__preview">
                        <div className="text">{L2("mapTypes." + mapType)}</div>
                    </div>
                    {terrainOption && (
                        <div className="terrainOverlayOptions" onClick={event => event.stopPropagation()}>
                            <label>
                                <span>{L2("mapTypes.contours")}</span>
                                <input
                                    type="checkbox"
                                    checked={this.props.terrainOverlays.contours}
                                    onChange={this.onTerrainOverlayChange.bind(this, "contours")}
                                />
                            </label>
                            <label>
                                <span>{L2("mapTypes.hillshade")}</span>
                                <input
                                    type="checkbox"
                                    checked={this.props.terrainOverlays.hillshade}
                                    onChange={this.onTerrainOverlayChange.bind(this, "hillshade")}
                                />
                            </label>
                        </div>
                    )}
                </div>
            );
        });

        return (
            <div>
                <h4>{L2("settings.backgroundmap")}</h4>
                <div className={"MapTypeSelector" + (this.state.open ? " open" : "")} >
                    {options}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        locale: state.settings.locale,
        mapTypeId: state.settings.mapTypeId,
        terrainOverlays: state.settings.terrainOverlays
    };
};

export default connect(mapStateToProps)(MapTypeSelector);
