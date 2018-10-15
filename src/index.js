import React from 'react';
import ReactDOM from 'react-dom';
import LiveIndicator from './components/LiveIndicator';
import TopBar from './components/TopBar';
import Settings from './components/Settings';
import Menu from './components/Menu';
import Banner from './components/Banner';

window.liveIndicator = ReactDOM.render(<LiveIndicator />, document.getElementById('liveindpos'));

ReactDOM.render(<Banner callback={window.initSettings}/>, document.getElementById('bannerModal'));
ReactDOM.render(<TopBar />, document.getElementById('topbar'));
ReactDOM.render(<Settings callback={window.initSettings}/>, document.getElementById('settings'));
ReactDOM.render(<Menu callback={window.initMenu}/>, document.getElementById('menu'));

