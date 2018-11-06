import React, { Component } from 'react';
import InfoPage from './InfoPage';
import TopBar from './TopBar';
import Settings from './Settings';
import Menu from './Menu';
import LiveIndicator from './LiveIndicator';
import Timetables from './Timetables';
import MapContainer from './MapContainer';
import InfoContent from './InfoContent';
import InfoContent2 from './InfoContent2';
import { toggleScrollIndicator } from '../lib/uicontrol';

export default class Wrapper extends Component {

  componentDidMount() {
    window.addEventListener("resize", toggleScrollIndicator);
  }

  render() {
    return (
      <div id="wrapper">
        <div id="wrapper2" onScroll={toggleScrollIndicator}>
          <InfoPage />
          <div className="mapoverlay"></div>
          <div className="info" id="infoholder"><InfoContent /><InfoContent2 /></div>
        </div>

        <MapContainer />

        <div id="scrollIndicator"><i className="fa fa-ellipsis-h" aria-hidden="true"></i></div>

        <TopBar id="topbar" />
        <Menu />
        <Settings />
        <div id="liveindpos"><LiveIndicator /></div>
        <Timetables />
      </div >
    );
  }
}
