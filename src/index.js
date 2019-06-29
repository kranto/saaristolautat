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


window.initApplication = () => {
	txtol.init(window.google.maps.OverlayView);
	const map = createMap();
	initMapTypes(map);
	initObjectRenderer(map, txtol);
	initRoutes(map);
	new LiveLayer().init(map, txtol);
}

const getMapKey = () => {
	const hostname = document.location.hostname;
	switch (hostname) {
	case 'saaristolautat.fi': 
	case 'www.saaristolautat.fi': 
		return 'AIzaSyA__hjJJ5vFz6-8XwU-T0h8iI5bWJdD6P8';
	case 'demo.saaristolautat.fi':
		return 'AIzaSyCu0O7p5TDu2QmzghtSXzbJ3PByvi0KRbw';
	case 'test.saaristolautat.fi':
	case 'localhost':
		return 'AIzaSyAX_N6yFjHfac6v9-xiwA31yg1twAMMyGA';	
	default:
		return '';
	}
}

const loadGoogleMaps = () => {
	const googleMapScript = document.createElement('script');
	const key = getMapKey();
	googleMapScript.setAttribute('src','https://maps.googleapis.com/maps/api/js?key=' + key + '&v=3.33&callback=initApplication');
	document.body.appendChild(googleMapScript);	
}


//--

ReactDOM.render(<App />, document.getElementById('app'));	

initFullscreen(document.getElementById('wrapper'));
loadGoogleMaps();
