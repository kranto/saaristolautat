import React, { Component } from 'react';

export default class ScrollIndicator extends Component {
  render() {
    return (
      <div className={`scrollIndicator${this.props.visible ? ' can-scroll' : ''}`} aria-hidden="true" />
    );
  }
}
