import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './lib/dataloader';
import { initFullscreen } from './lib/fullscreen';

ReactDOM.render(<App />, document.getElementById('app'));
initFullscreen(document.getElementById('wrapper'));
