import React, { Component } from 'react';
import LocaleSelector from './LocaleSelector';

export default class Banner extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <img src="/mstile-70x70.png" style={{width: "40px", height: "40px"}} alt="Saaristolautat.fi"/>
            <h5 className="modal-title" style={{position: "relative", top: "10px", marginLeft: "20px"}}>Saaristolautat.fi</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{backgroundImage: "url('img/mapsample.png')"}}>
            <h5>
            <span lang="fi">Klikkaa reittiä kartalla nähdäksesi reitin tiedot</span>
            <span lang="sv">Klicka en rutt på kartan för information</span>
            <span lang="en">Click a route on map to see route details</span>
            </h5>
            <i style={{position: "fixed", top: "50%", right: "20%", fontSize: "30px", color: "#304070"}} className="fa fa-mouse-pointer faa-tada animated" aria-hidden="true"></i>
            <ul style={{ position: "relative", left: "30px"}}>
            <li><span lang="fi">Reitit</span><span lang="sv">Rutter</span><span lang="en">Routes</span></li>
            <li><span lang="fi">Aikataulut</span><span lang="sv">Tidtabeller</span><span lang="en">Schedules</span></li>
            <li><span lang="fi">Yhteystiedot</span><span lang="sv">Kontaktuppgifter</span><span lang="en">Contact information</span></li>
            </ul>
            <div id="banner-locale-selector" style={{width: "150px", marginTop: "20px"}}>
              <LocaleSelector />
            </div>
          </div>
          <div className="modal-footer">
            <div className="checkbox dont-show-again" id="dont-show-again">
              <input id="dont-show-again-cb" type="checkbox" value="false" version="1"/>
              <label htmlFor="dont-show-again-cb">
                <span lang="fi">Älä näytä uudestaan</span>
                <span lang="sv">Visa inte mer</span>
                <span lang="en">Don't show again</span>
              </label>
            </div>
            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    );
  }
}
