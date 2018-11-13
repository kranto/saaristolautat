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
import { toggleScrollIndicator } from '../lib/uicontrol';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const $ = window.$;

function getAllEvents(element) {
  const result = [];
  for (let key in element) {
    if (key.indexOf('on') === 0) result.push(key.slice(2));
  }
  return result.join(' ');
}


class Wrapper extends Component {
  constructor(props) {
    super(props);
    this.state = { pointerOnInfoPanel: false };
  }

  componentDidMount() {
    window.addEventListener("resize", toggleScrollIndicator);
    this.initMapOverlayEvents();
  }

  initMapOverlayEvents() {
    var el = $(".mapoverlay");
    el.bind(getAllEvents(el[0]), e => {
      this.setState({ pointerOnInfoPanel: false });
      $("#mapcontainer").trigger(e.type, e);
    });
  }

  componentDidUpdate() {
    toggleScrollIndicator();
  }

  onMouseEnterInfo(event) {
    this.setState({ pointerOnInfoPanel: true });
    $("#wrapper2").trigger(event.type, event);
  }

  onMouseLeaveInfo(event) {
    this.setState({ pointerOnInfoPanel: false });
  }

  render() {
    const infoOpen = (this.props.routeid || this.props.infoContent2) && !this.props.infoPage;
    const pointerEvents = this.state.pointerOnInfoPanel && infoOpen ? "auto" : "none"
    return (
      <div id="wrapper">
        <div id="wrapper2" className={infoOpen ? "info-open" : ""} onScroll={toggleScrollIndicator}
          style={{ pointerEvents }}>

          <div className="mapoverlay" style={{ pointerEvents }}></div>

          <ReactCSSTransitionGroup transitionName="info"
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}>
            {infoOpen ?
              <InfoContainer key="1" onMouseEnter={this.onMouseEnterInfo.bind(this)} onMouseLeave={this.onMouseLeaveInfo.bind(this)} />
              : ""}
          </ReactCSSTransitionGroup>
        </div>

        <MapContainer />

        <div id="scrollIndicator"><i className="fa fa-ellipsis-h" aria-hidden="true"></i></div>

        <TopBar id="topbar" />
        <Menu />
        <Settings />
        <div id="liveindpos"><LiveIndicator /></div>
        <Timetables />
        <InfoPage />

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