import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FullScreenButton from './FullScreenButton';
import SettingsLayers from './SettingsLayers';
import MapTypeSelector from './MapTypeSelector';
import LocaleSelector from './LocaleSelector';

const isIOS = /(iPhone|iPad|iPod)/.test(window.navigator.userAgent);

export default class SearchPanel extends Component {

  componentDidUpdate() {
    if (!this.props.open) ReactDOM.findDOMNode(this).scrollTop = 0;
  }

  results = [{title: "Utön reitti", type: "reitti", description: "Yhteysalus"}, {title: "Jurmo", type: "saari", description: "Saari Korppoossa"}];

  render() {
    return (
      <div id="searchpanel" className={"slidedownmenu" + (this.props.open ? " open" : "")}>
        <input type="text" name="slsearchbox" className="slsearchbox" placeholder="Search route, island, dock or vessel" maxlength="30"></input>
        <div id="searchresults">
          {this.results.map(r => (<div>{r.title}</div>))}        
        </div>
      </div>
    );
  }
}
