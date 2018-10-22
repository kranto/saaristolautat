import React, { Component } from 'react';
import Loader from './components/Loader';
import Banner from './components/Banner';
import Wrapper from './components/Wrapper';
import { currentLang } from './lib/localizer';
import { Provider } from "react-redux";
import store from "./store";

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="app">
          <Loader lang={currentLang} />
          <Banner />
          <Wrapper />
          <canvas id="canvas" style={{ display: "none" }}></canvas>
        </div>
      </Provider>
    );
  }
}
