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
import ScrollIndicator from './ScrollIndicator';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {toggleMenu, toggleSearch, toggleSettings} from '../lib/uicontrol';
import { phases } from '../lib/constants';
import SearchPanel from './SearchPanel';

const $ = window.$;

function getAllEvents(element) {
  const result = [];
  for (let key in element) {
    if (key.indexOf('on') === 0) result.push(key.slice(2));
  }
  return result.join(' ');
}

const scrollLimit = 22;

const isIOS = /(iPhone|iPad|iPod)/.test(window.navigator.userAgent);
let previous = undefined

class Wrapper extends Component {
  constructor(props) {
    super(props);
    this.state = { pointerOnInfoPanel: false };
  }

  componentDidMount() {
    window.addEventListener("resize", this.onScroll.bind(this));
    this.initMapOverlayEvents();
  }

  initMapOverlayEvents() {
    var el = $(".mapoverlay");
    el.bind(getAllEvents(el[0]), e => {
      this.setState({ pointerOnInfoPanel: false });
      $("#mapcontainer").trigger(e.type, e);
    });
  }

  onMouseEnterInfo(event) {
    this.setState({ pointerOnInfoPanel: true });
    $("#wrapper2").trigger(event.type, event);
  }

  onMouseLeaveInfo(event) {
    this.setState({ pointerOnInfoPanel: false });
  }

  componentDidUpdate() {
    previous = this.props.routeid;
  }

  onScroll() {
    var elem = $("#wrapper2");
    if (!elem || !elem[0]) return false;
    var isBottom = (elem[0].scrollHeight - elem.scrollTop() - scrollLimit <= elem.outerHeight());
    $('.scrollIndicator').toggleClass('can-scroll', !isBottom);

    var height = $(".mapoverlay").outerHeight();
    $(".closeInfoButton").toggleClass('fix', elem.scrollTop() > height);
  }

  render() {
    const infoOpen = (this.props.routeid || this.props.infoContent2) && !this.props.infoPage;
    const touchFocusInInfo = infoOpen && (this.state.pointerOnInfoPanel || (isIOS && this.props.routeid !== previous))
    const pointerEvents = touchFocusInInfo ? "auto" : "none"
    return (
      <div id="wrapper" className={infoOpen ? "info-open" : ""}>
        <div id="wrapper2" className={infoOpen ? "info-open" : ""} onScroll={this.onScroll.bind(this)}
          style={{ pointerEvents }}>

          <div className="mapoverlay" style={{ pointerEvents }}></div>

          <ReactCSSTransitionGroup transitionName="info"
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}>
            {infoOpen ?
              <InfoContainer key="1" 
              onMouseEnter={this.onMouseEnterInfo.bind(this)}
              onMouseLeave={this.onMouseLeaveInfo.bind(this)} />
              : ""}
          </ReactCSSTransitionGroup>
        </div>

        <MapContainer />

        <TopBar id="topbar" onMenuButtonClicked={toggleMenu} onSettingsButtonClicked={toggleSettings} 
          onSearchButtonClicked={toggleSearch} searchOpen={this.props.uiState.searchOpen}
          menuOpen={this.props.uiState.menuOpen} settingsOpen={this.props.uiState.settingsOpen}
          introduction={this.props.uiState.phase === phases.INTRODUCTION}/>
        <Menu open={this.props.uiState.menuOpen}/>
        <SearchPanel open={this.props.uiState.searchOpen}/>
        <Settings open={this.props.uiState.settingsOpen}/>
        <div id="liveindpos"><LiveIndicator /></div>
        <Timetables />
        <InfoPage />

        <ScrollIndicator />
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
    data: state.data.data,
    uiState: state.uiState
  };
};

export default connect(mapStateToProps)(Wrapper);