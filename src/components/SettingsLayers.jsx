import React, { Component } from 'react';
import SettingsLayerItem from './SettingsLayerItem';
import { L2 } from '../lib/localizer';
import { connect } from 'react-redux';
import { setLayer } from '../actions/settingsActions';

class SettingsLayers extends Component {

  layerItems = [
    { id: "cbbig", target: "longdistanceferries" },
    { id: "cbconn2", target: "roadferries" },
    { id: "cbconn4", target: "conn4" },
    { id: "cbrist", target: "conn5" },
    { id: "cbring", target: "ringroads" },
    { id: "cbdist", target: "distances" },
    { id: "cblive", target: "live" },
  ];

  onChange(target, isActive) {
    this.props.dispatch(setLayer(target, isActive));
  }

  render() {
    const items = this.layerItems.map(item =>
      <SettingsLayerItem key={item.id} id={item.id} checked={this.props.layers[item.target]} name={L2("mapLayers." + item.target)} onChange={(isOn) => this.onChange(item.target, isOn)} />
    );
    return (
      <div className="settingslayers">
        <h4>{L2("mapLayers.title")}</h4>
        {items}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    layers: state.settings.layers
  };
};

export default connect(mapStateToProps)(SettingsLayers);
