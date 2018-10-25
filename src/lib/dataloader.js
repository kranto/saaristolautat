import axios from 'axios';  

const baseUri = '/data/';
const indexUri = baseUri + 'index.json?v=' + (Math.random() + "").substring(2);
const indexP = axios.get(indexUri);

let allPs;

indexP.then(({data: indexData}) => {
  const dataP = axios.get(baseUri + indexData.data);
  const geoPs = indexData.geojson.map(uri => axios.get(baseUri + uri));
  allPs = geoPs.slice();
  allPs.unshift(dataP);  
});

export function loadFerriesData(callback) {
  indexP.then(() => {
    Promise.all(allPs)
    .then((responses) => {
      const data = responses.shift().data;
      const geos = responses.map(response => response.data);
      callback(data, geos);
    });  
  });
}