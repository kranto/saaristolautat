import axios from 'axios';
import store from '../store';

const baseUri = 'data/';
const indexUri = baseUri + 'index.json?v=' + (Math.random() + "").substring(2);
const indexP = axios.get(indexUri);

indexP.then(({data: indexData}) => {
  const dataP = axios.get(baseUri + indexData.data);
  const geoPs = indexData.geojson.map(uri => axios.get(baseUri + uri));

  store.dispatch({type: "LOADING_DATA", payload: dataP});
  store.dispatch({type: "LOADING_GEOJSON", payload: Promise.all(geoPs)});
});