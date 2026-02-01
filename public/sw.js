/**
 * File: public/sw.js
 * Version: 1.8.51
 * Author: Sut
 */

const CACHE_NAME = 'aura-flux-v1.8.51';
const ASSETS = [ './', './index.html', './manifest.json', './pwa-icon.svg' ];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});
...