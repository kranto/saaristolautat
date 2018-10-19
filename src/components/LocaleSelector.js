import React, { Component } from 'react'
import { setLanguage } from '../lib/localizer';

export default class LocaleSelector extends Component {

  locales = [ "fi", "sv", "en"];

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  onButtonClicked(event) {
    setLanguage(event.target.getAttribute("setlang"));
  }

  render() {
    return (
        <div className="LocaleSelector">
          <div className="btn-group" style={{ width: "100%" }}>
            <button type="button" className="btn btn-secondary lang-button" setlang="fi" style={{ width: "33%" }} onClick={this.onButtonClicked}>FI</button>
            <button type="button" className="btn btn-secondary lang-button" setlang="sv" style={{ width: "34%" }} onClick={this.onButtonClicked}>SV</button>
            <button type="button" className="btn btn-secondary lang-button" setlang="en" style={{ width: "33%" }} onClick={this.onButtonClicked}>EN</button>
          </div>
        </div>
    );
  }
}
