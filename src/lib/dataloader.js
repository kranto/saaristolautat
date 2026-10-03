import store from '../store';

const getJson = uri => fetch(uri).then(response => {
  if (!response.ok) {
    throw new Error(`Failed to load ${uri}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}).then(data => ({data}));

const reactAppVersion = import.meta.env.VITE_APP_VERSION || '20230601000000';
const baseUri = 'data/';
const indexUri = baseUri + 'index.json?v=' + (Math.random() + "").substring(2) + "&app_v=" + reactAppVersion;
const indexP = getJson(indexUri);

indexP.then(({data: indexData}) => {
  store.dispatch({type: "DATA_VERSION", payload: indexData.data.split('?v=')[1]});

  const dataP = getJson(baseUri + indexData.data);
  const geoPs = indexData.geojson.map(uri => getJson(baseUri + uri));

  store.dispatch({type: "LOADING_DATA", payload: dataP});
  store.dispatch({type: "LOADING_GEOJSON", payload: Promise.all(geoPs)});
});
