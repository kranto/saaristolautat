import React, { Component } from 'react';
import {unselectAll} from '../lib/ferries';
import { onlyUnique } from '../lib/datautils';
import { toggleScrollIndicator } from '../lib/uicontrol';

export default class InfoContent2 extends Component {

  componentDidUpdate() {
    toggleScrollIndicator();
  }
  
  shouldComponentUpdate(props) {
    return props.targets;
  }

  render() {
    if (!this.props.targets) return <div />;
    
    const targets = this.props.targets;
    const names = targets.map(function (target) { return target.name; }).filter(onlyUnique);
    const nameItems = names.map(name => 
      <div key={name} className="routeheader">{name}</div>
    );

    const contentItems = targets.map(content => 
      <a key={content.name + content.operator.name} href={content.operator.link} target="operator">
        <div className="contentbox">
          <div className="routename">{content.name}</div>
          <div className="routedetails">{content.details}</div>
          <div className="routeoperatorlogo">
            <img src={content.operator.logo} height={content.operator.height} alt={content.operator.name}/>
          </div>
        </div>
      </a>
    );

    return (
      <div className="infocontent">

        <button type="button" className="btn btn-secondary closeInfoButton" onClick={unselectAll}><i className="fa fa-times" aria-hidden="true"></i></button>

        <div className="headerbox">{nameItems}</div>
        <div className="contentsbox">{contentItems}</div>
      </div>
    );
  }
}
