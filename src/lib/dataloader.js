import axios from 'axios';
import store from '../store';

const reactAppVersion = process.env.REACT_APP_VERSION || '20230601000000';
const baseUri = 'data/';
const indexUri = baseUri + 'index.json?v=' + (Math.random() + "").substring(2) + "&app_v=" + reactAppVersion;
const indexP = axios.get(indexUri);

indexP.then(({data: indexData}) => {
  store.dispatch({type: "DATA_VERSION", payload: indexData.data.split('?v=')[1]});

  const dataP = axios.get(baseUri + indexData.data);
  const geoPs = indexData.geojson.map(uri => axios.get(baseUri + uri));

  store.dispatch({type: "LOADING_DATA", payload: dataP});
  store.dispatch({type: "LOADING_GEOJSON", payload: Promise.all(geoPs)});
});