import React, { Component } from 'react';
import FullScreenButton from './FullScreenButton';
import SettingsLayers from './SettingsLayers';
import MapTypeSelector from './MapTypeSelector';
import LocaleSelector from './LocaleSelector';

export default class Settings extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  render() {
    return (
      <div id="settings">
        <div className="menucontainer" id="settingscontent">

          <div className="boxs"><MapTypeSelector /></div>

          <div className="boxs"><FullScreenButton /></div>

          <div className="boxs"><SettingsLayers /></div>

          <div className="boxs"><LocaleSelector /></div>

        </div>
      </div>
    );
  }
}
