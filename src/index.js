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

const loadGoogleMaps = () => {
	const googleMapScript = document.createElement('script');
	googleMapScript.setAttribute('src','https://maps.googleapis.com/maps/api/js?key=AIzaSyAX_N6yFjHfac6v9-xiwA31yg1twAMMyGA&v=3.33&callback=initApplication');
	document.body.appendChild(googleMapScript);	
}

//--

ReactDOM.render(<App />, document.getElementById('app'));	

initFullscreen(document.getElementById('wrapper'));
loadGoogleMaps();
