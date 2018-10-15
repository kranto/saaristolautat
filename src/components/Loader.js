import React, { Component } from 'react';

export default class Loader extends Component {

  textsAll = {
    fi : {
      main: "Turun saariston ja Ahvenanmaan lauttareitit",
      islands: "40000 saarta<br/>50 lauttaa<br/>200 laituria",
      loading: "Ladataan..."
    },
    sv: {
      main: "Skärgårdsfärjorna i Skärgårdshavet",
      islands: "40000 öar<br/>50 färjor<br/>200 bryggor",
      loading: "Laddas..."
    },
    en: {
      main: "Ferry routes in the Finnish archipelago",
      islands: "40000 islands<br/>50 ferries<br/>200 piers",
      loading: "Loading..."
    }
  }

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const lang = this.props.lang || "fi";
    const texts = this.textsAll[lang];
    return (
      <div>
        <div id="loaderbox">
          <div id="loaderheader">
            <img src="/mstile-70x70.png" alt="Saaristolautat.fi"/>
          </div>
          <div id="loadercontent">
            <h1>Saaristolautat.fi (react)</h1>
            <p>{texts.main}</p>
            <p dangerouslySetInnerHTML={{__html: texts.islands}}></p>
          </div>
        </div>
        <div style={{position: "absolute", bottom: "30px", textAlign: "center", width: "100%", color: "white"}}>
          <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
          <div style={{fontSize: "20px", display: "inline-block", position: "relative", top: "-7px"}}>
            {texts.loading}
          </div>
        </div>
      </div>
    );
  }
}
