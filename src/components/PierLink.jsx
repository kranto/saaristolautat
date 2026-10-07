import React, { Component } from 'react';
import { closeMapPierTooltip, showMapPierTooltip } from '../lib/mapnavigation';

let isTouch = false;

export default class PierLink extends Component {

  onMouseEnter() {
    if (!isTouch && !this.props.panelIsHidden) {
      showMapPierTooltip(this.props.pier.id, false);
    }
  }

  onMouseLeave() {
    if (!this.props.panelIsHidden) closeMapPierTooltip(this.props.pier.id);
  }

  onMouseDown() {
    if (!isTouch) this.props.setHidden(true);;
  }

  onMouseUp() {
    if (!isTouch) this.props.setHidden(false);
  }

  onTouchStart() {
    isTouch = true;
    showMapPierTooltip(this.props.pier.id, true);
    this.props.setHidden(true);
  }

  onTouchEnd() {
    this.props.setHidden(false);
  }

  componentWillUnmount() {
    closeMapPierTooltip(this.props.pier.id);
  }

  render() {
    const { pier } = this.props;
    return (
      <div key={pier.id} className={"pierlink " + pier.class}
        onMouseEnter={this.onMouseEnter.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        onTouchStart={this.onTouchStart.bind(this)}
        onTouchEnd={this.onTouchEnd.bind(this)}
      >
        <span className="pier">{pier.name}{pier.name_local ? "/" : ""}{pier.name_local}</span>
        <span className="pierspecifier"> {pier.specifier}</span>
      </div>
    );
  }
}
