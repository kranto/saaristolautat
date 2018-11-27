import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FullScreenButton from './FullScreenButton';
import SettingsLayers from './SettingsLayers';
import MapTypeSelector from './MapTypeSelector2';
import LocaleSelector from './LocaleSelector';

export default class Settings extends Component {

  componentDidUpdate() {
    if (!this.props.open) ReactDOM.findDOMNode(this).scrollTop = 0;
  }

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
