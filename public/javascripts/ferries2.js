
var mapOptions = {
  center: {lat: 60.25, lng: 21.25},
  zoom: 9,
  minZoom: 4,
  maxZoom: 15,
  mapTypeControl: false,
  fullscreenControl: false,
  streetViewControl: false,
  gestureHandling: 'greedy',
  scaleControl: true,
  styles: [],
};


function initMap() {

  console.log('initMap');
  var data = {};
  // txtol.init();

  console.log('initMap');
  map = new google.maps.Map(window.document.getElementById('map'), mapOptions);
  console.log('initMap');

}

