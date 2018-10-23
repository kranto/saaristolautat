import axios from 'axios';  

const geo1P = axios.get('/data/saaristo.json?v=1.5');
const geo2P = axios.get('/data/roads.json?v=1');
const geo3P = axios.get('/data/routes.json?v=1');
const dataP = axios.get('/data/data.json?v=1.24');

export function loadFerriesData(callback) {

  Promise.all([dataP, geo1P, geo2P, geo3P])
  .then(([{data}, {data: geo1}, {data: geo2}, {data: geo3}]) => {
    callback(data, [geo1, geo2, geo3]);
  });

}