import React, { Component } from 'react';
import { L2 } from '../lib/localizer';
import { connect } from 'react-redux';
import { selectMapType, setTerrainOverlay } from '../actions/settingsActions';

class MapTypeSelector extends Component {
    constructor(props) {
        super(props);
        this.state = { open: false }
    }

    mapTypes = ["openfreemap", "openfreemapTerrain", "OSM"];

    previewImages = {
        openfreemapTerrain: "openfreemap-terrain"
    };

    componentDidUpdate(previousProps) {
        if (previousProps.settingsOpen && !this.props.settingsOpen && this.state.open) {
            this.setState({ open: false });
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
        if (!this.props.settingsOpen) {
            return "";
        }

        const options = this.mapTypes.map(mapType => {
            const terrainOption = mapType === "openfreemapTerrain";
            const classes = "mapSelectOption" +
                (terrainOption ? " mapSelectOption--terrain" : "") +
                (this.props.mapTypeId === mapType ? " selected" : "");
            const previewImage = this.previewImages[mapType] || mapType;
            return (
                <div key={mapType} data-target={mapType} onClick={this.onClick.bind(this)} className={classes}>
                    <div className="mapSelectOption__preview">
                        <img src={"img/" + previewImage + ".png"} alt={L2("mapTypes." + mapType)} style={{ maxWidth: "100%", maxHeight: "100%" }} />
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
