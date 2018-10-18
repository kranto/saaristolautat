import React, { Component } from 'react';
import {toggleMenu, toggleSettings} from '../lib/uicontrol';

export default class TopBar extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div id="topbar">
        <button id="menubutton" type="button" className="topbarbutton" onClick={toggleMenu}>
          <i className="fa fa-bars" aria-hidden="true"></i>
        </button>
        <div id="topbartitle">
          Saaristolautat.fi
        </div>
        <button id="settingsbutton" type="button" className="topbarbutton right" onClick={toggleSettings}>
          <i className="fa fa-sliders" aria-hidden="true"></i>
        </button>
      </div>
    );
  }
}
