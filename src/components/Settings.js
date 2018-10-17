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

  toggleFullscreen() {
    window.toggleFullscreen();
  }

  render() {
    return (
      <div id="settings">
        <div className="menucontainer" id="settingscontent">

          <div className="boxs"><MapTypeSelector /></div>

          <div className="boxs">
            <button type="button" className="btn btn-secondary" id="toggleFullscreen" style={{ width: "100%" }} onClick={this.toggleFullscreen}>
              <span lang="fi">Koko ruutu</span><span lang="sv">Full screen</span><span lang="en">Full screen</span>
            </button>
          </div>

          <div className="boxs"><SettingsLayers /></div>

          <div className="boxs"><LocaleSelector /></div>

        </div>
      </div>
    );
  }
}
