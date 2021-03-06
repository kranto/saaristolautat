import React, { Component } from 'react';
import Loader from './components/Loader';
import Banner from './components/Banner';
import Wrapper from './components/Wrapper';
import { Provider } from "react-redux";
import store from "./store";
import './App.css';

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="app">
          <Loader />
          <Banner />
          <Wrapper />
        </div>
      </Provider>
    );
  }
}
