
/**
 * File: vite.config.ts
 * Version: 1.0.9
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
    format: 'iife',
    plugins() {
      return [
        {
          name: 'worker-alias-resolver',
          resolveId(source, importer) {
            // Only apply to worker files
            if (importer && importer.includes('worker')) {
              if (source.startsWith('@/')) {
                return source.replace('@/', './');
              }
            }
            return null;
          },
        },
      ];
    },
  },
  build: {
    outDir: 'build',
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
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
