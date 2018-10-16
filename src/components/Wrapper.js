import React, { Component } from 'react';

export default class Wrapper extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div>
        <div id="wrapper2">
          <div id="infopage" className="fmodal" style={{display: "none"}}></div>
          <div className="mapoverlay"></div>
          <div className="info" id="infoholder"></div>
        </div>

        <div id="mapcontainer">
          <div id="map" className="map"></div>
        </div>

        <div id="scrollIndicator"><i className="fa fa-ellipsis-h" aria-hidden="true"></i></div>
        <div id="topbar"></div>
        <div id="liveindpos"></div>
        <div id="menu"></div>
        <div id="settings"></div>
        <div id="timetables" className="fmodal" style={{display: "none"}}></div>
      </div>
    );
  }
}
