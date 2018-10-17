import React, { Component } from 'react';
import InfoPage from './InfoPage';
import TopBar from './TopBar';
import Settings from './Settings';
import Menu from './Menu';

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
          <InfoPage />
          <div className="mapoverlay"></div>
          <div className="info" id="infoholder"></div>
        </div>

        <div id="mapcontainer">
          <div id="map" className="map"></div>
        </div>

        <div id="scrollIndicator"><i className="fa fa-ellipsis-h" aria-hidden="true"></i></div>

        <TopBar id="topbar" />
        <Menu />
        <Settings />
        <div id="liveindpos"></div>
        <div id="timetables" className="fmodal" style={{display: "none"}}></div>
      </div>
    );
  }
}
