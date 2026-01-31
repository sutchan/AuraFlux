/**
 * File: public/sw.js
 * Version: 1.8.25
 * Author: Sut
 */

const CACHE_NAME = 'aura-flux-v1.8.25';
const ASSETS = [ './', './index.html', './manifest.json', './pwa-icon.svg' ];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); }))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});