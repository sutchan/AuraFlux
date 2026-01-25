/**
 * File: index.tsx
 * Version: 1.7.32
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-04 11:00
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import './assets/styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(
      (registration) => {
        console.log('SW registered: ', registration);
      },
      (registrationError) => {
        console.log('SW registration failed: ', registrationError);
      }
    );
  });
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);