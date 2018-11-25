import React, { Component } from 'react';
import FullScreenButton from './FullScreenButton';
import SettingsLayers from './SettingsLayers';
import MapTypeSelector from './MapTypeSelector2';
import LocaleSelector from './LocaleSelector';

export default class Settings extends Component {

  render() {
    return (
      <div id="settings" className={"slidedownmenu" + (this.props.open ? " open" : "")}>
          <div className="boxs"><MapTypeSelector settingsOpen={this.props.open}/></div>

          <div className="boxs"><FullScreenButton /></div>

          <div className="boxs"><SettingsLayers /></div>

          <div className="boxs"><LocaleSelector /></div>
      </div>
    );
  }
}
