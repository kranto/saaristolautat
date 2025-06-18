import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import txtol from './lib/txtol';
import { initMapTypes } from './lib/maptypes';
import LiveLayer from './lib/live';
import { initObjectRenderer } from './lib/objects';
import './lib/mapcontrol';
import  {initFullscreen} from './lib/fullscreen';
import { createMap } from './lib/ferries';
import './lib/dataloader';
import { initRoutes } from './lib/routes';
import LocationLayer from './lib/location';

window.initApplication = () => {
	txtol.init(window.google.maps.OverlayView);
	const map = createMap();
	initMapTypes(map);
	initObjectRenderer(map, txtol);
	initRoutes(map);
	new LiveLayer().init(map, txtol);
	new LocationLayer().init(map);
}

const getMapKey = () => {
	const hostname = document.location.hostname;
	switch (hostname) {
	case 'saaristolautat.fi': 
	case 'www.saaristolautat.fi': 
		return 'apikeyhere';
	case 'demo.saaristolautat.fi':
		return 'apikeyhere';
	case 'test.saaristolautat.fi':
	case 'localhost':
		return 'apikeyhere';
	default:
		return '';
	}
}

const loadGoogleMaps = () => {
	const googleMapScript = document.createElement('script');
	const key = getMapKey();
	googleMapScript.setAttribute('src','https://maps.googleapis.com/maps/api/js?key=' + key + '&v=quarterly&callback=initApplication');
	document.body.appendChild(googleMapScript);	
}


//--

ReactDOM.render(<App />, document.getElementById('app'));	

initFullscreen(document.getElementById('wrapper'));
loadGoogleMaps();
