import React, { Component } from 'react';
import {L2} from '../lib/localizer';

export default class TopBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideBubbles: false
    }
  }

  componentDidMount() {
    setTimeout(() => this.setState({hideBubbles: true}), 15000);
  }

  render() {
    const descriptionClasses = "description" + (this.state.hideBubbles ? " hide" : "");
    return (
      <div id="topbar">
        <button type="button" className={"topbarbutton" + (this.props.menuOpen ? " active" : "")} onClick={this.props.onMenuButtonClicked}>
          <i className="fa fa-bars" aria-hidden="true"></i>
          <span className={descriptionClasses}>{L2("topbar.info")}</span>
        </button>
        <div id="topbartitle">
          {L2("application.title")}
        </div>
        <button type="button" className={"topbarbutton right" + (this.props.settingsOpen ? " active" : "")} 
          onClick={this.props.onSettingsButtonClicked}>
          <span className={descriptionClasses}>{L2("topbar.settings")}</span><i className="fa fa-sliders" aria-hidden="true"></i>
        </button>
      </div>
    );
  }
}
