import React, { Component } from 'react'

export default class LocaleSelector extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
        <div className="LocaleSelector">
          <div className="btn-group" style={{ width: "100%" }}>
            <button type="button" className="btn btn-secondary lang-button" setlang="fi" style={{ width: "33%" }}>FI</button>
            <button type="button" className="btn btn-secondary lang-button" setlang="sv" style={{ width: "34%" }}>SV</button>
            <button type="button" className="btn btn-secondary lang-button" setlang="en" style={{ width: "33%" }}>EN</button>
          </div>
        </div>
    );
  }
}
