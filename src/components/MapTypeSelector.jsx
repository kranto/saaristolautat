import React, { Component } from 'react';
import { L2 } from '../lib/localizer';
import { connect } from 'react-redux';
import { selectMapType } from '../actions/settingsActions';

class MapTypeSelector extends Component {
    constructor(props) {
        super(props);
        this.state = { open: false }
    }

    mapTypes = ["roadmap", "satellite", "hybrid", "terrain", "OSM", "MMLTAUSTA", "MMLMAASTO"];

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

    render() {
        if (!this.props.settingsOpen) {
            if (this.state.open) this.setState({ open: false });
            return "";
        }

        const options = this.mapTypes.map(mapType => {
            const classes = "mapSelectOption" + (this.props.mapTypeId === mapType ? " selected" : "");
            return (
                <div key={mapType} data-target={mapType} onClick={this.onClick.bind(this)} className={classes}>
                    <div style={{ position: "relative", pointerEvents: "none" }}>
                        <img src={"img/" + mapType + ".png"} alt={mapType} style={{ maxWidth: "100%", maxHeight: "100%" }}></img>
                        <div className="text">{L2("mapTypes." + mapType)}</div>
                    </div>
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
        mapTypeId: state.settings.mapTypeId
    };
};

export default connect(mapStateToProps)(MapTypeSelector);
