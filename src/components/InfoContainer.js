import React, { Component } from 'react';
import InfoContent from './InfoContent';
import InfoContent2 from './InfoContent2';

export default class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { hidden: false }

    window.$("body").mouseup(() => {
      this.setState({ hidden: false });
    });
  }

  setHidden(hidden) {
    this.setState({ hidden: hidden });
  }

  render() {
    return (
      <div id="infoholder" className={"info" + (this.state.hidden ? " hidden" : "")}
      onMouseLeave={this.props.onMouseLeave}
      onMouseEnter={this.props.onMouseEnter}
      onMouseDown={this.props.onMouseEnter}
      onTouchStart={this.props.onMouseEnter}>
        <InfoContent isHidden={this.state.hidden} setHidden={this.setHidden.bind(this)} />
        <InfoContent2 />
      </div>
    );
  }
}
