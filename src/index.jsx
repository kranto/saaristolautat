import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './lib/dataloader';
import { initFullscreen } from './lib/fullscreen';
import store from './store';
import { initAnalytics, initSettingsAnalytics } from './lib/analytics';

initAnalytics();
initSettingsAnalytics(store);
ReactDOM.render(<App />, document.getElementById('app'));
initFullscreen(document.getElementById('wrapper'));

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`/service-worker.js?v=${import.meta.env.VITE_APP_VERSION}`)
      .catch(error => console.warn('Offline support unavailable', error));
  });
}
