import React from 'react';
import ReactDOM from 'react-dom';
import LiveIndicator from './components/LiveIndicator';
import TopBar from './components/TopBar';
import Settings from './components/Settings';
import Menu from './components/Menu';
import Banner from './components/Banner';
import Loader  from './components/Loader';
import InfoContent2  from './components/InfoContent2';
import Timetables  from './components/Timetables';

ReactDOM.render(<Loader lang={window.currentFerriesLang}/>, document.getElementById('loader'));	

window.liveIndicator = ReactDOM.render(<LiveIndicator />, document.getElementById('liveindpos'));

ReactDOM.render(<Banner callback={window.initSettings}/>, document.getElementById('bannerModal'));
ReactDOM.render(<TopBar />, document.getElementById('topbar'));
ReactDOM.render(<Settings callback={window.initSettings}/>, document.getElementById('settings'));
ReactDOM.render(<Menu callback={window.initMenu}/>, document.getElementById('menu'));

window.setInfoContent2 = function(data) {
	ReactDOM.render(<InfoContent2 names={data.names} contents={data.contents} />, document.getElementById('infoholder'));
}

window.unsetInfoContent2 = function() {
	ReactDOM.unmountComponentAtNode(document.getElementById('infoholder'));
}

window.setTimetables = function(data) {
	ReactDOM.render(<Timetables data={data} lang={window.currentFerriesLang} />, document.getElementById('timetables'));
}

window.unsetTimetables = function() {
	ReactDOM.unmountComponentAtNode(document.getElementById('timetables'));
}

