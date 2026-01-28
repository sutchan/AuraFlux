/**
 * File: core/workers/visualizer.worker.ts
 * Version: 1.7.33
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-08 12:00
 *
 * This worker script is responsible for offloading 2D visualizer rendering
 * from the main thread using OffscreenCanvas.
 */

// --- 1. IMPORT DEPENDENCIES (Strictly Relative Paths) ---
import { VisualizerMode, VisualizerSettings, WorkerMessage, IVisualizerRenderer } from '../types';
import { createVisualizerRenderers, BeatDetector } from '../services/visualizerStrategies';
import { AdaptiveNoiseFilter } from '../services/audioUtils';

// --- 2. WORKER MAIN LOGIC ---

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let width = 0, height = 0, dpr = 1;
let currentMode: VisualizerMode = VisualizerMode.PLASMA;
let currentSettings: VisualizerSettings | null = null;
let currentColors: string[] = ['#ffffff'];
let lastFrameData: Uint8Array | null = null;
let rotation = 0;

let renderers: Record<string, IVisualizerRenderer> = {};

try {
    renderers = createVisualizerRenderers();
} catch (e) {
    console.error("[Worker] Failed to instantiate renderers:", e);
}

const beatDetector = new BeatDetector();
const noiseFilter = new AdaptiveNoiseFilter(); // Stateful filter instance for worker

const loop = () => {
  if (!ctx || !currentSettings) {
    requestAnimationFrame(loop);
    return;
  };

  ctx.save();
  // Apply DPR scaling for crisp rendering
  ctx.scale(dpr, dpr);

  // Logical dimensions for drawing operations
  const logicalW = width;
  const logicalH = height;

  if (currentSettings.trails) {
    // Advanced Trails Logic:
    // If we have an Album Art Background active, we need to clear to TRANSPARENT, not Black.
    // 'destination-out' composites the new shape (rect) onto the existing content, 
    // removing the destination (existing content) where they overlap based on alpha.
    if (currentSettings.albumArtBackground) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = `rgba(0, 0, 0, 0.15)`; // Remove 15% opacity per frame
        ctx.fillRect(0, 0, logicalW, logicalH);
        ctx.globalCompositeOperation = 'source-over'; // Reset
    } else {
        // Standard Behavior: Overlay semi-transparent black to create fade-to-black trails
        ctx.fillStyle = `rgba(0, 0, 0, 0.15)`;
        ctx.fillRect(0, 0, logicalW, logicalH);
    }
  } else {
    ctx.clearRect(0, 0, logicalW, logicalH);
  }

  rotation += 0.005 * currentSettings.speed;
  const data = lastFrameData || new Uint8Array(0);
  
  // Intelligent Noise Filtering in Worker
  if (data.length > 0) {
      noiseFilter.process(data);
  }

  const isBeat = data.length > 0 ? beatDetector.detect(data) : false;

  const renderer = renderers[currentMode];
  if (renderer) {
    try {
      // Pass logical dimensions to renderer, not buffer dimensions
      renderer.draw(ctx, data, logicalW, logicalH, currentColors, currentSettings, rotation, isBeat);
    } catch (e: any) {
      if (Math.random() < 0.01) console.error(`[Worker] Renderer ${currentMode} error:`, e.message);
    }
  }
  
  ctx.restore();
  requestAnimationFrame(loop);
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;
  switch (msg.type) {
    case 'INIT':
      canvas = msg.canvas;
      width = msg.width;
      height = msg.height;
      dpr = msg.devicePixelRatio || 1;
      
      // Set actual buffer size (physical pixels)
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }) as OffscreenCanvasRenderingContext2D;
      Object.values(renderers).forEach(r => r?.init(canvas));
      loop();
      break;
    case 'RESIZE':
      width = msg.width;
      height = msg.height;
      dpr = msg.devicePixelRatio || 1;
      if (canvas) { 
        canvas.width = width * dpr; 
        canvas.height = height * dpr;
      }
      break;
    case 'CONFIG':
      const modeChanged = currentMode !== msg.mode;
      currentMode = msg.mode;
      currentSettings = msg.settings;
      currentColors = msg.colors;

      if (modeChanged && ctx) {
        ctx.clearRect(0, 0, width, height); // Always clear fully on mode change
        const renderer = renderers[currentMode];
        if (renderer && renderer.init) {
            renderer.init(canvas);
        }
      }
      break;
    case 'FRAME':
      lastFrameData = msg.data;
      break;
  }
};