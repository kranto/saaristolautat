(function () {
  var environment = null;
  if (window.location.hostname === 'test.saaristolautat.fi') environment = 'test';
  if (window.location.hostname === 'saaristolautat.fi' || window.location.hostname === 'www.saaristolautat.fi') {
    environment = 'production';
  }
  if (!environment) return;

  window.goatcounter = {
    path: '/' + environment + window.location.pathname,
  };
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = 'https://saaristolautat.goatcounter.com/count';
  document.head.appendChild(script);
}());
