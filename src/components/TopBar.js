import React, { Component } from 'react';

export default class TopBar extends Component {

  render() {
    return (
      <div id="topbar">
        <button id="menubutton" type="button" className="topbarbutton" onClick={this.props.onMenuButtonClicked}>
          <i className="fa fa-bars" aria-hidden="true"></i>
        </button>
        <div id="topbartitle">
          Saaristolautat.fi
        </div>
        <button id="settingsbutton" type="button" className="topbarbutton right" onClick={this.props.onSettingsButtonClicked}>
          <i className="fa fa-sliders" aria-hidden="true"></i>
        </button>
      </div>
    );
  }
}
