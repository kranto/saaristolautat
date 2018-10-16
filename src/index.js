import React from 'react';
import ReactDOM from 'react-dom';
import LiveIndicator from './components/LiveIndicator';
import TopBar from './components/TopBar';
import Settings from './components/Settings';
import Menu from './components/Menu';
import Banner from './components/Banner';
import Loader  from './components/Loader';
import InfoPage  from './components/InfoPage';
import InfoContent2  from './components/InfoContent2';
import InfoContent  from './components/InfoContent';
import Timetables  from './components/Timetables';
import txtol from './lib/txtol';
import { initMapTypes } from './lib/maptypes';
import { initLiveLayer } from './lib/live';

window.txtol = txtol;

let map = null;
window.initApplication = () => {
	txtol.init();
	map = window.initMap();
	initMapTypes(map);
	window.liveLayer = initLiveLayer(map, txtol, window.L2);
	window.initLayers();
}

const loadGoogleMaps = () => {
	const googleMapScript = document.createElement('script');
	googleMapScript.setAttribute('src','https://maps.googleapis.com/maps/api/js?key=AIzaSyAX_N6yFjHfac6v9-xiwA31yg1twAMMyGA&callback=initApplication');
	document.body.appendChild(googleMapScript);	
}

//--

ReactDOM.render(<Loader lang={window.currentFerriesLang}/>, document.getElementById('loader'));	

window.liveIndicator = ReactDOM.render(<LiveIndicator />, document.getElementById('liveindpos'));

ReactDOM.render(<Banner callback={window.initSettings}/>, document.getElementById('bannerModal'));
ReactDOM.render(<TopBar />, document.getElementById('topbar'));
ReactDOM.render(<Settings callback={window.initSettings}/>, document.getElementById('settings'));
ReactDOM.render(<Menu callback={window.initMenu}/>, document.getElementById('menu'));
ReactDOM.render(<InfoPage callback={window.initInfoPage}/>, document.getElementById('infopage'));

window.setInfoContent1 = function(data) {
	ReactDOM.render(<InfoContent data={data} lang={window.currentFerriesLang}/>, document.getElementById('infoholder'));
}

window.unsetInfoContent1 = function() {
	ReactDOM.unmountComponentAtNode(document.getElementById('infoholder'));
}

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

loadGoogleMaps();
