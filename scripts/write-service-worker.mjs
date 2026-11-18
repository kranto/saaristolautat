import { readdir, readFile, writeFile } from 'node:fs/promises';

const assets = (await readdir('build/assets')).map(name => `/assets/${name}`);
const precache = [
  '/index.html',
  '/timetable.html',
  ...assets,
  '/css/bootstrap.min.css',
  '/css/font-awesome-animation.min.css',
  '/css/font-awesome.min.css',
  '/fonts/fontawesome-webfont.woff2',
  '/js/jquery.min.js',
  '/js/tether.min.js',
  '/js/bootstrap.min.js',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/mstile-70x70.png',
  '/img/banner-map.png',
  '/img/offline-basemap.webp',
  '/img/openfreemap.png',
  '/img/openfreemap-terrain-options.png',
  '/img/OSM.png'
];
const template = await readFile('scripts/service-worker.template.js', 'utf8');
const version = process.env.VITE_APP_VERSION || 'dev';
await writeFile('build/service-worker.js', template
  .replace('__VERSION__', version)
  .replace('__PRECACHE__', JSON.stringify(precache)));
