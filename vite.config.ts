/**
 * File: vite.config.ts
 * Version: 1.7.32
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
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
      // Externalize dependencies to share single instances defined in importmap
      external: [
        'react', 
        'react-dom', 
        'three', 
        '@react-three/fiber', 
        '@react-three/drei', 
        '@react-three/postprocessing', 
        '@google/genai'
      ]
    }
  },
  build: {
    outDir: 'build',
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      // Externalize dependencies to use the versions defined in index.html importmap
      // This prevents "Multiple instances of Three.js" warning by avoiding local bundling
      external: [
        'react', 
        'react-dom', 
        'three', 
        '@react-three/fiber', 
        '@react-three/drei', 
        '@react-three/postprocessing', 
        '@google/genai'
      ]
    }
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})