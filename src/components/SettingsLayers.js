import React, { Component } from 'react';
import SettingsLayerItem from './SettingsLayerItem';
import { L2 } from '../lib/localizer';
import { connect } from 'react-redux';

class SettingsLayers extends Component {

  layerItems = [
    { id: "cbbig", target:"longdistanceferries"},
    { id: "cbconn2", target:"roadferries"},
    { id: "cbconn4", target:"conn4"},
    { id: "cbrist", target:"conn5"},
    { id: "cbring", target:"ringroads"},
    { id: "cbdist", target:"distances"},
    { id: "cblive", target:"live"},
  ];

  render() {
    const items = this.layerItems.map(item =>
      <SettingsLayerItem key={item.id} id={item.id} target={item.target} name={L2("mapLayers." + item.target)}/>
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
        locale: state.settings.locale
    };
};

export default connect(mapStateToProps)(SettingsLayers);
