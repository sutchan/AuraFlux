/**
 * File: public/sw.js
 * Version: 1.6.29
 * Author: Aura Flux Team
 */

const CACHE_NAME = 'aura-flux-v1.6.29';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './pwa-icon.svg'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      ))
    ])
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});