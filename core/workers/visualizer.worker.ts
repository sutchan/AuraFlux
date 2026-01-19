/**
 * File: core/workers/visualizer.worker.ts
 * Version: 1.1.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 *
 * This worker script is responsible for offloading 2D visualizer rendering
 * from the main thread using OffscreenCanvas.
 */

// --- 1. IMPORT DEPENDENCIES (Strictly Relative Paths) ---
import { VisualizerMode, VisualizerSettings, WorkerMessage, IVisualizerRenderer } from '../types';
import { createVisualizerRenderers, BeatDetector } from '../services/visualizerStrategies';

// --- 2. WORKER MAIN LOGIC ---

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let width = 0, height = 0;
let currentMode: VisualizerMode = VisualizerMode.PLASMA;
let currentSettings: VisualizerSettings | null = null;
let currentColors: string[] = ['#ffffff'];
let lastFrameData: Uint8Array | null = null;
let rotation = 0;

// Instantiate renderers using the shared factory
let renderers: Record<string, IVisualizerRenderer> = {};

try {
    renderers = createVisualizerRenderers();
} catch (e) {
    console.error("[Worker] Failed to instantiate renderers:", e);
}

const beatDetector = new BeatDetector();

const loop = () => {
  if (!ctx || !currentSettings) {
    requestAnimationFrame(loop);
    return;
  };

  const smoothColors = currentColors; 
  
  if (currentSettings.trails) {
    ctx.fillStyle = `rgba(0, 0, 0, 0.15)`;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  rotation += 0.005 * currentSettings.speed;
  const data = lastFrameData || new Uint8Array(0);
  const isBeat = data.length > 0 ? beatDetector.detect(data) : false;

  const renderer = renderers[currentMode];
  if (renderer) {
    try {
      renderer.draw(ctx, data, width, height, smoothColors, currentSettings, rotation, isBeat);
    } catch (e: any) {
      // Prevent worker crash loop, just log once or fallback
      if (Math.random() < 0.01) console.error(`[Worker] Renderer ${currentMode} error:`, e.message);
    }
  }

  requestAnimationFrame(loop);
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;
  switch (msg.type) {
    case 'INIT':
      canvas = msg.canvas;
      width = msg.width;
      height = msg.height;
      // 'desynchronized' provides lower latency
      ctx = canvas.getContext('2d', { alpha: false, desynchronized: true }) as OffscreenCanvasRenderingContext2D;
      Object.values(renderers).forEach(r => r?.init(canvas));
      loop();
      break;
    case 'RESIZE':
      width = msg.width;
      height = msg.height;
      if (canvas) { canvas.width = width; canvas.height = height; }
      break;
    case 'CONFIG':
      const modeChanged = currentMode !== msg.mode;
      currentMode = msg.mode;
      currentSettings = msg.settings;
      currentColors = msg.colors;

      if (modeChanged && ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
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