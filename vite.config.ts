/**
 * File: vite.config.ts
 * Version: 1.8.6
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-07 11:00
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// List of dependencies to treat as external, both for the build and dev server.
// This ensures they are loaded via the importmap in index.html, preventing duplicates.
const externalPackages = [
  'react',
  'react-dom',
  'three',
  '@react-three/fiber',
  '@react-three/drei',
  '@react-three/postprocessing',
  '@google/genai'
];

export default defineConfig({
  plugins: [react()],
  base: './',
  // Exclude packages from Vite's dependency pre-bundling to rely on the importmap.
  optimizeDeps: {
    exclude: externalPackages
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  worker: {
    // Use 'es' format for modern module workers.
    format: 'es', 
    rollupOptions: {
      // Externalize dependencies to share single instances defined in importmap
      external: externalPackages
    }
  },
  build: {
    outDir: 'build',
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      // Externalize dependencies to use the versions defined in index.html importmap
      // This prevents "Multiple instances of Three.js" warning by avoiding local bundling
      external: externalPackages
    }
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})