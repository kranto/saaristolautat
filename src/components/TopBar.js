import React, { Component } from 'react';
import SettingsLayers from './SettingsLayers';
import MapTypeSelector from './MapTypeSelector';
import LocaleSelector from './LocaleSelector';

export default class Settings extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div id="topbar">
        <button id="menubutton" type="button" className="topbarbutton">
          <i className="fa fa-bars" aria-hidden="true"></i>
        </button>
        <div id="topbartitle">
          Saaristolautat.fi
        </div>
        <button id="settingsbutton" type="button" className="topbarbutton right">
          <i className="fa fa-sliders" aria-hidden="true"></i>
        </button>
      </div>
    );
  }
}
