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
import { toggleScrollIndicator, initMapOverlayEvents, initInfoEvents } from '../lib/uicontrol';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Wrapper extends Component {

  componentDidMount() {
    window.addEventListener("resize", toggleScrollIndicator);
    initMapOverlayEvents();

  }

  infoOpen = false;
  prevInfoOpen = false;

  componentDidUpdate() {
    if (this.infoOpen && !this.prevInfoOpen) initInfoEvents();
    this.prevInfoOpen = this.infoOpen;
    toggleScrollIndicator();
  }

  render() {
    this.infoOpen = (this.props.routeid || this.props.infoContent2) && !this.props.infoPage;
    return (
      <div id="wrapper">
        <div id="wrapper2" className={this.infoOpen? "info-open" : ""} onScroll={toggleScrollIndicator}>
          <InfoPage />
          <div className="mapoverlay"></div>

          <ReactCSSTransitionGroup transitionName="info"
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}>
            {this.infoOpen ? <InfoContainer key="1" /> : ""}
          </ReactCSSTransitionGroup>
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

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    timetableid: state.selection.timetables,
    routeid: state.selection.infoContent,
    infoContent2: state.selection.infoContent2,
    infoPage: state.selection.infoPage,
    data: state.data.data
  };
};

export default connect(mapStateToProps)(Wrapper);