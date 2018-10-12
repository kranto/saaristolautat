import React from 'react';
import ReactDOM from 'react-dom';
import LiveIndicator from './components/LiveIndicator';

window.liveIndicator = ReactDOM.render(<LiveIndicator />, document.getElementById('liveindpos'));
