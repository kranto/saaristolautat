import React, { Component } from 'react';

export default class InfoContent2 extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const nameItems = this.props.names.map(name => 
      <div key={name} className="routeheader">{name}</div>
    );

    const contentItems = this.props.contents.map(content => 
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

        <button type="button" className="btn btn-secondary closeInfoButton"><i className="fa fa-times" aria-hidden="true"></i></button>

        <div className="headerbox">{nameItems}</div>
        <div className="contentsbox">{contentItems}</div>
      </div>
    );
  }
}
