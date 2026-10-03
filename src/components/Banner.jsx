import React, { Component } from 'react';
import LocaleSelector from './LocaleSelector';
import { L2 } from '../lib/localizer';
import { connect } from 'react-redux';

class Banner extends Component {

  render() {
    return (
      <div id="bannerModal" className="modal fade" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <img src="/mstile-70x70.png" style={{ width: "40px", height: "40px" }} alt="Saaristolautat.fi" />
              <h5 className="modal-title" style={{ position: "relative", top: "10px", marginLeft: "20px" }}>{L2("application.title")}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body" style={{ backgroundImage: "url('img/mapsample.png')" }}>
              <h5>{L2("banner.clickRoute")}</h5>
              <i style={{ position: "fixed", top: "50%", right: "20%", fontSize: "30px", color: "#304070" }} className="fa fa-mouse-pointer faa-tada animated" aria-hidden="true"></i>
              <ul style={{ position: "relative", left: "30px" }}>
                <li>{L2("banner.routes")}</li>
                <li>{L2("banner.timetables")}</li>
                <li>{L2("banner.contactInfo")}</li>
              </ul>
              <div id="banner-locale-selector" style={{ width: "150px", marginTop: "20px" }}>
                <LocaleSelector />
              </div>
            </div>
            <div className="modal-footer">
              <div className="checkbox dont-show-again" id="dont-show-again">
                <input id="dont-show-again-cb" type="checkbox" value="false" version="1" />
                <label htmlFor="dont-show-again-cb">{L2("banner.dontshowagain")}</label>
              </div>
              <button type="button" className="btn btn-secondary" data-dismiss="modal">{L2("banner.close")}</button>
            </div>
          </div>
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

export default connect(mapStateToProps)(Banner);