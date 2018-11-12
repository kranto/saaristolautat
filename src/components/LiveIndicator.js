import React, { Component } from 'react'
import { connect } from 'react-redux';
import { L2 } from '../lib/localizer';

class LiveIndicator extends Component {

  render() {
    const msg = this.props.live.msg ? L2(this.props.live.msg) : "";
    const showMsg = msg || L2("live.closing");
    return (
      <div id="liveind" className={msg ? "visible" : "hidden"}>
        <span id="liveindtxt">{showMsg}</span>
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