import React from 'react';
import { Provider } from "react-redux";
import store from "./store";
import Loader from './components/Loader';
import Banner from './components/Banner';
import Wrapper from './components/Wrapper';
import './App.css';

export default function App() {
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
