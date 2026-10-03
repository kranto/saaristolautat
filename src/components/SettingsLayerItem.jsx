import React, { Component } from 'react'

export default class SettingsLayerItem extends Component {

  onChange(event) {
    this.props.onChange(event.target.checked);
  }

  render() {
    return (
      <div className="layer">
        <input type="checkbox" id={this.props.id} checked={this.props.checked} onChange={this.onChange.bind(this)}/>
        <label className="layerselector" htmlFor={this.props.id}>{this.props.name}</label>
      </div>
    );
  }
}
