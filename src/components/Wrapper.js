import React, { Component } from 'react';
import { connect } from 'react-redux';
import InfoPage from './InfoPage';
import TopBar from './TopBar';
import Settings from './Settings';
import Menu from './Menu';
import LiveIndicator from './LiveIndicator';
import Timetables from './Timetables';
import MapContainer from './MapContainer';
import InfoContainer from './InfoContainer';
import { toggleScrollIndicator, initMapOverlayEvents } from '../lib/uicontrol';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Wrapper extends Component {

  componentDidMount() {
    window.addEventListener("resize", toggleScrollIndicator);
  }

  infoOpen = false;
  prevInfoOpen = false;

  componentDidUpdate() {
    if (this.infoOpen && !this.prevInfoOpen) initMapOverlayEvents();
    this.prevInfoOpen = this.infoOpen;
  }

  render() {
    this.infoOpen = this.props.routeid || this.props.infoContent2;
    return (
      <div id="wrapper">
        <div id="wrapper2" onScroll={toggleScrollIndicator}>
            {/* <div className="info" id="infoholder" key={1}><InfoContent /><InfoContent2 /></div> */}
            <InfoPage />
          <div className="mapoverlay"></div>

          <ReactCSSTransitionGroup transitionName="info"
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}>
            {this.infoOpen ? <InfoContainer key="1" /> : "" }
          </ReactCSSTransitionGroup>
        </div>

        <MapContainer />

        <div id="scrollIndicator"><i className="fa fa-ellipsis-h" aria-hidden="true"></i></div>

        <TopBar id="topbar" />
        <Menu />
        <Settings />
        <div id="liveindpos"><LiveIndicator /></div>

        <ReactCSSTransitionGroup transitionName="timetable"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}>
          {(this.props.timetableid) ? <Timetables key="1" /> : ""}
        </ReactCSSTransitionGroup>
      </div >
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    timetableid: state.selection.timetables,
    routeid: state.selection.infoContent,
    infoContent2: state.selection.infoContent2,
    data: state.data.data
  };
};

export default connect(mapStateToProps)(Wrapper);