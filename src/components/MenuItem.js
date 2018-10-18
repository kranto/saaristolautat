import React, { Component } from 'react'
import {menuItemClicked} from '../lib/ferries';

export default class MenuItem extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  onMenuItemClick() {
    menuItemClicked("#" + this.props.target);
  }

  render() {
    let spans = Object.keys(this.props.name).map(lang =>
      <span key={lang} lang={lang}> {this.props.name[lang]}</span>
    );
    return (
      <div className="box" data-target={"#" + this.props.target} onClick={this.onMenuItemClick.bind(this)}>
        {spans}
      </div>
    );
  }
}
