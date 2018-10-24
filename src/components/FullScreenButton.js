import React, { Component } from 'react'
import { connect } from 'react-redux';
import {L2} from '../lib/localizer';
import {toggleFullscreen} from '../lib/fullscreen';

class FullScreenButton extends Component {

  render() {
    return (
      <button type="button" className={"btn btn-secondary " + (this.props.isFullSceen? "active": "")} id="toggleFullscreen" style={{ width: "100%" }} onClick={toggleFullscreen}>
        {L2("settings.fullscreen")}
      </button>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    isFullSceen: state.settings.isFullScreen,
    dispatch: state.dispatch
  };
};

export default connect(mapStateToProps)(FullScreenButton);