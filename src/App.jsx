import React from 'react';
import { Provider } from "react-redux";
import store from "./store";
import MapLibrePrototype from './components/MapLibrePrototype';
import './App.css';

export default function App() {
  return (
    <Provider store={store}>
      <MapLibrePrototype />
    </Provider>
  );
}
