import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import txtol from './lib/txtol';
import { initMapTypes } from './lib/maptypes';
import LiveLayer from './lib/live';
import { initObjectRenderer } from './lib/objects';
import { loadFerriesData } from './lib/dataloader';
import { initRoutes } from './lib/routes';
import './lib/uicontrol';
import './lib/mapcontrol';
import  {initFullscreen} from './lib/fullscreen';
import { createMap, initMap, initSettings } from './lib/ferries';

window.initApplication = () => {
	txtol.init(window.google.maps.OverlayView);
	const map = createMap();
	initMapTypes(map);
	const objectRenderer = initObjectRenderer(map, txtol);
	initMap(map, objectRenderer, initRoutes, loadFerriesData);
	new LiveLayer().init(map, txtol);
}

const loadGoogleMaps = () => {
	const googleMapScript = document.createElement('script');
	googleMapScript.setAttribute('src','https://maps.googleapis.com/maps/api/js?key=AIzaSyAX_N6yFjHfac6v9-xiwA31yg1twAMMyGA&v=3.33&callback=initApplication');
	document.body.appendChild(googleMapScript);	
}

const initElements = () => {
	initSettings();
}

//--

ReactDOM.render(<App />, document.getElementById('app'));	

initFullscreen(document.getElementById('wrapper'));
initElements();
loadGoogleMaps();
