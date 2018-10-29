import React, { Component } from 'react'
import {menuItemClicked} from '../lib/ferries';

export default class MenuItem extends Component {

  onMenuItemClick() {
    menuItemClicked("#" + this.props.target);
  }

  render() {
    return (
      <div className="box" data-target={"#" + this.props.target} onClick={this.onMenuItemClick.bind(this)}>
        {this.props.name}
      </div>
    );
  }
}
