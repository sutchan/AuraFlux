
/**
 * File: public/sw.js
 * Version: 1.6.6
 * Author: Aura Flux Team
 */

const CACHE_NAME = 'aura-flux-v1.6.6';
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
  // Network first strategy to ensure latest app version, falling back to cache if offline.
  // This is crucial for an app that might receive frequent updates.
  if (e.request.method !== 'GET') return;
  
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Optional: Dynamic caching of successful responses could go here
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
