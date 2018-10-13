import React, { Component } from 'react';
import SettingsLayers from './SettingsLayers';
import MapTypeSelector from './MapTypeSelector';

export default class Settings extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div className="menucontainer" id="settingscontent">

        <MapTypeSelector className="boxs" />

        <div className="boxs">
          <button type="button" className="btn btn-secondary" id="toggleFullscreen" style={{width: "100%"}}>
            <span lang="fi">Koko ruutu</span><span lang="sv">Full screen</span><span lang="en">Full screen</span>
          </button>
        </div>

        <SettingsLayers className="boxs"/>

        <div className="boxs">
          <div className="btn-group" style={{ width: "100%" }}>
            <button type="button" className="btn btn-secondary lang-button" setlang="fi" style={{ width: "33%" }}>FI</button>
            <button type="button" className="btn btn-secondary lang-button" setlang="sv" style={{ width: "34%" }}>SV</button>
            <button type="button" className="btn btn-secondary lang-button" setlang="en" style={{ width: "33%" }}>EN</button>
          </div>
        </div>
      </div>
    );
  }
}
