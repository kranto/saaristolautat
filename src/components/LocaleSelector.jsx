import React, { Component } from 'react'
import { connect } from 'react-redux';
import { localeSet } from '../actions/settingsActions';

class LocaleSelector extends Component {

  locales = ["fi", "sv", "en"];

  onButtonClicked(event) {
    this.props.dispatch(localeSet(event.target.getAttribute("setlang")));
  }

  render() {
    const buttons = this.locales.map((locale) =>
      (<button key={locale} type="button" className={"btn btn-secondary lang-button" + (this.props.locale === locale ? " active" : "")} setlang={locale} style={{ width: "33%" }} onClick={this.onButtonClicked.bind(this)}>{locale.toUpperCase()}</button>)
    );
    return (
      <div className="LocaleSelector">
        <div className="btn-group" style={{ width: "100%" }}>
          {buttons}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale
  };
};

export default connect(mapStateToProps)(LocaleSelector);