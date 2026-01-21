
/**
 * File: vite.config.ts
 * Version: 1.6.4
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  worker: {
    // Use 'es' format for modern module workers.
    format: 'es', 
    rollupOptions: {
      // Bundling dependencies into workers is crucial for stability.
      external: []
    }
  },
  build: {
    outDir: 'build',
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      external: [] // Three.js is now bundled
    }
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})
