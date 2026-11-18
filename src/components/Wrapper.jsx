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
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import {toggleMenu, toggleSearch, toggleSettings} from '../lib/uicontrol';
import { phases } from '../lib/constants';
import SearchPanel from './SearchPanel';

const $ = window.$;

const scrollLimit = 22;
const forwardedMapEventTypes = [
  "touchstart", "touchmove", "touchend", "touchcancel",
  "mousedown", "mousemove", "mouseup", "mouseover", "mouseout",
  "click", "dblclick", "wheel", "contextmenu"
];

function copyTouch(touch, target) {
  return new Touch({
    identifier: touch.identifier,
    target,
    clientX: touch.clientX,
    clientY: touch.clientY,
    screenX: touch.screenX,
    screenY: touch.screenY,
    pageX: touch.pageX,
    pageY: touch.pageY,
    radiusX: touch.radiusX,
    radiusY: touch.radiusY,
    rotationAngle: touch.rotationAngle,
    force: touch.force
  });
}

function forwardMapEvent(event) {
  const target = document.querySelector("#mapcontainer .maplibregl-canvas-container");
  if (!target) return;

  let forwarded;
  if (event.type.startsWith("touch")) {
    const copyTouches = touches => Array.from(touches, touch => copyTouch(touch, target));
    forwarded = new TouchEvent(event.type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      touches: copyTouches(event.touches),
      targetTouches: copyTouches(event.targetTouches),
      changedTouches: copyTouches(event.changedTouches)
    });
  } else if (event.type === "wheel") {
    forwarded = new WheelEvent(event.type, {
      bubbles: true,
      cancelable: true,
      clientX: event.clientX,
      clientY: event.clientY,
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaMode: event.deltaMode,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    });
  } else {
    forwarded = new MouseEvent(event.type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: event.clientX,
      clientY: event.clientY,
      screenX: event.screenX,
      screenY: event.screenY,
      button: event.button,
      buttons: event.buttons,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    });
  }

  target.dispatchEvent(forwarded);
  if (forwarded.defaultPrevented && event.cancelable) event.preventDefault();
}

class Wrapper extends Component {
  constructor(props) {
    super(props);
    this.state = { canScrollInfo: false };
  }

  componentDidMount() {
    window.addEventListener("resize", this.onScroll.bind(this));
    this.mapOverlay = document.querySelector(".mapoverlay");
    forwardedMapEventTypes.forEach(type => {
      this.mapOverlay?.addEventListener(type, forwardMapEvent, type === "touchmove" || type === "wheel" ? { passive: false } : undefined);
    });
  }

  componentWillUnmount() {
    forwardedMapEventTypes.forEach(type => {
      this.mapOverlay?.removeEventListener(type, forwardMapEvent, type === "touchmove" || type === "wheel" ? { passive: false } : undefined);
    });
  }

  componentDidUpdate(prevProps) {
    const infoOpen = Boolean((this.props.routeid || this.props.infoContent2) && !this.props.infoPage);
    const infoWasOpen = Boolean((prevProps.routeid || prevProps.infoContent2) && !prevProps.infoPage);
    if (!infoOpen) {
      if (this.state.canScrollInfo) this.setState({ canScrollInfo: false });
    } else if (!infoWasOpen || this.props.routeid !== prevProps.routeid || this.props.infoContent2 !== prevProps.infoContent2) {
      window.requestAnimationFrame(() => this.onScroll());
    }
  }

  onScroll() {
    var elem = $("#wrapper2");
    if (!elem || !elem[0]) return false;
    var isBottom = (elem[0].scrollHeight - elem.scrollTop() - scrollLimit <= elem.outerHeight());
    const infoOpen = Boolean((this.props.routeid || this.props.infoContent2) && !this.props.infoPage);
    const canScrollInfo = infoOpen && !isBottom;
    if (canScrollInfo !== this.state.canScrollInfo) this.setState({ canScrollInfo });

    var height = $(".mapoverlay").outerHeight();
    $(".closeInfoButton").toggleClass('fix', elem.scrollTop() > height);
  }

  render() {
    const infoOpen = (this.props.routeid || this.props.infoContent2) && !this.props.infoPage;
    return (
      <div id="wrapper" className={infoOpen ? "info-open" : ""}>
        <div id="wrapper2" className={infoOpen ? "info-open" : ""} onScroll={this.onScroll.bind(this)}>

          <div className="mapoverlay"></div>

          <TransitionGroup component={null}>
            {infoOpen ?
              <CSSTransition key="info" classNames="info" timeout={200}>
                <InfoContainer />
              </CSSTransition>
              : null}
          </TransitionGroup>
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

        <ScrollIndicator visible={infoOpen && this.state.canScrollInfo} />
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
