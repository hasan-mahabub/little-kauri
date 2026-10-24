'use strict';

const CACHE = 'little-kauri-v11';
const CORE = [
  './', './index.html', './styles.css', './app.js', './parent.js',
  './stages/first6/worlds.js', './stages/first6/games.js',
  './manifest.webmanifest', './icon.svg', './privacy.html',
  './images/girl.svg', './images/boy.svg',
  './fonts/andika-700-latin.woff2', './fonts/andika-700-latin-ext.woff2',
  './fonts/baloo2-latin.woff2', './fonts/baloo2-latin-ext.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Code is network first so updates show up; sounds and fonts are cache first so they load instantly.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || request.headers.has('range') || url.origin !== self.location.origin) return;
  const cacheFirst = url.pathname.includes('/sounds/') || url.pathname.includes('/fonts/');
  event.respondWith(cacheFirst ? cacheThenNetwork(request) : networkThenCache(request));
});

async function cacheThenNetwork(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
  return response;
}

async function networkThenCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
    return response;
  } catch (err) {
    const hit = await caches.match(request, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}
