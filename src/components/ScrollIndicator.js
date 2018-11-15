import React, { Component } from 'react';

export default class ScrollIndicator extends Component {
  render() {
    return (
      <div className="scrollIndicator">
        <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
      </div>
    );
  }
}
