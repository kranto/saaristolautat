import React, { Component } from 'react';
import {L2} from '../lib/localizer';

export default class Loader extends Component {

  render() {
    return (
      <div id="loader">
        <div id="loaderbox">
          <div id="loaderheader">
            <img src="/mstile-70x70.png" alt="Logo"/>
          </div>
          <div id="loadercontent">
            <h1>{L2("application.title")}</h1>
            <p>{L2("loader.main")}</p>
            <p dangerouslySetInnerHTML={{__html: L2("loader.islands")}}></p>
          </div>
        </div>
        <div style={{position: "absolute", bottom: "30px", textAlign: "center", width: "100%", color: "white"}}>
          <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
          <div style={{fontSize: "20px", display: "inline-block", position: "relative", top: "-7px"}}>
            {L2("loader.loading")}
          </div>
        </div>
        <div style={{position: "absolute", bottom: "2px", textAlign: "right", width: "100%", color: "#bbb", fontSize: "10px"}}>
          {process.env.REACT_APP_VERSION}
        </div>
      </div>
    );
  }
}
