import React, { Component } from 'react';
import SettingsLayerItem from './SettingsLayerItem';

export default class SettingsLayers extends Component {

  layerItems = [
    { id: "cbbig", target:"longdistanceferries", name: { fi: "Suuret autolautat", sv: "Stora bilfärjorna", en: "Large car ferries"}},
    { id: "cbconn2", target:"roadferries", name: { fi: "Maantielautat", sv: "Landvägsfärjorna", en: "Road ferries"}},
    { id: "cbconn4", target:"conn4", name: { fi: "Yhteysalukset", sv: "Förbindelsefartygen", en: "Commuter ferries"}},
    { id: "cbrist", target:"conn5", name: { fi: "Risteilyreitit", sv: "Kryssningrutterna", en: "Cruise routes"}},
    { id: "cbring", target:"ringroads", name: { fi: "Rengastiet", sv: "Ringvägarna", en: "Ring roads"}},
    { id: "cbdist", target:"distances", name: { fi: "Välimatkat", sv: "Avstånden", en: "Distances"}},
    { id: "cblive", target:"live", name: { fi: "Live", sv: "Live", en: "Live"}},
  ];

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const items = this.layerItems.map(item =>
      <SettingsLayerItem key={item.id} id={item.id} target={item.target} name={item.name}/>
    );
    return (
      <div className="settingslayers">
        <h4 lang="fi">Karttatasot</h4>
        <h4 lang="sv">Kartanivåerna</h4>
        <h4 lang="en">Map Layers</h4>
        {items}
      </div>
    );
  }
}
