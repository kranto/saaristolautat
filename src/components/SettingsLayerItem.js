import React, { Component } from 'react'

export default class SettingsLayerItem extends Component {

  render() {
    return (
      <div className="layer">
        <input type="checkbox" id={this.props.id} data-target={this.props.target}/>
        <label className="layerselector" htmlFor={this.props.id}>{this.props.name}</label>
      </div>
    );
  }
}
