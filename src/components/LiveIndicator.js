import React, { Component } from 'react'
import { connect } from 'react-redux';
import { L2 } from '../lib/localizer';

class LiveIndicator extends Component {

  showMsg = "";

  render() {
    const msg = this.props.live.msg ? L2(this.props.live.msg) : "";
    this.showMsg = msg || this.showMsg;
    return (
      <div id="liveind" className={msg ? "visible" : "hidden"}>
        <span id="liveindtxt">{this.showMsg}</span>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    live: state.live
  };
};

export default connect(mapStateToProps)(LiveIndicator);