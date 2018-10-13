import React, { Component } from 'react'

export default class SettingsLayerItem extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    let spans = Object.keys(this.props.name).map(lang =>
      <span key={lang} lang={lang}> {this.props.name[lang]}</span>
    );
    return (
      <div className="layer">
        <input type="checkbox" id={this.props.id} data-target={this.props.target}/>
        <label className="layerselector" htmlFor={this.props.id}>{spans}</label>
      </div>
    );
  }
}
