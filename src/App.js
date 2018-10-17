import React, { Component } from 'react';
import Loader  from './components/Loader';
import Banner from './components/Banner';
import Wrapper from './components/Wrapper';

export default class App extends Component {
  render() {
    return (
      <div className="app">
        <Loader lang={window.currentFerriesLang} />	
        <Banner />
        <Wrapper />
        <canvas id="canvas" style={{display: "none"}}></canvas>
      </div>
    );
  }
}
