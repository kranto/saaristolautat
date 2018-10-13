import React from 'react';
import ReactDOM from 'react-dom';
import LiveIndicator from './components/LiveIndicator';
import Settings from './components/Settings';
import Menu from './components/Menu';

window.liveIndicator = ReactDOM.render(<LiveIndicator />, document.getElementById('liveindpos'));

ReactDOM.render(<Settings callback={window.initSettings}/>, document.getElementById('settings'));
ReactDOM.render(<Menu callback={window.initMenu}/>, document.getElementById('menu'));
