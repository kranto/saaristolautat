import React, { Component } from 'react'

export default class MenuItem extends Component {

  render() {
    return (
      <div className="box" onClick={this.props.onClick}>
        {this.props.name}
      </div>
    );
  }
}
