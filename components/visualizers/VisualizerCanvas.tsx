
/**
 * File: components/visualizers/VisualizerCanvas.tsx
 * Version: 1.0.3
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React, { useRef, useEffect, useState } from 'react';
import { VisualizerMode, VisualizerSettings } from '../../core/types/index';

// Direct import of renderers for fallback
import { 
  BarsRenderer, RingsRenderer, FluidCurvesRenderer, MacroBubblesRenderer, 
  ParticlesRenderer, NebulaRenderer, TunnelRenderer, PlasmaRenderer, 
  LasersRenderer, BeatDetector
} from '../../core/services/visualizerStrategies';

// WORKER IMPORT (v1.0.3 Standard)
import VisualizerWorker from '@/core/workers/visualizer.worker.ts?worker';

interface VisualizerCanvasProps {
  analyser: AnalyserNode | null;
  mode: VisualizerMode;
  colors: string[];
  settings: VisualizerSettings;
}

const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ 
  analyser, mode, colors, settings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const isOffscreenRef = useRef<boolean>(false);
  const renderersRef = useRef<any>({});
  const beatDetectorRef = useRef(new BeatDetector());
  const requestRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset offscreen flag
    isOffscreenRef.current = false;

    // 1. Attempt to use Worker (OffscreenCanvas)
    // We check for transferControlToOffscreen support
    if (!!canvas.transferControlToOffscreen && !workerRef.current) {
        try {
            const offscreen = canvas.transferControlToOffscreen();
            
            // Initialize Worker
            const worker = new VisualizerWorker();
            
            worker.postMessage({ 
                type: 'INIT', 
                canvas: offscreen, 
                width: canvas.clientWidth, 
                height: canvas.clientHeight, 
                devicePixelRatio: window.devicePixelRatio || 1
            }, [offscreen]);
            
            workerRef.current = worker;
            isOffscreenRef.current = true;
            console.log("[Visualizer] Worker initialized successfully");
        } catch (e) {
            console.warn("[Visualizer] Worker init failed, falling back to main thread:", e);
            // Fallback logic continues below
        }
    }

    // 2. Fallback to Main Thread Rendering if Worker failed or not supported
    if (!isOffscreenRef.current && Object.keys(renderersRef.current).length === 0) {
        console.log("[Visualizer] Running in Main Thread Mode");
        renderersRef.current = {
          [VisualizerMode.BARS]: new BarsRenderer(),
          [VisualizerMode.RINGS]: new RingsRenderer(),
          [VisualizerMode.PARTICLES]: new ParticlesRenderer(),
          [VisualizerMode.TUNNEL]: new TunnelRenderer(),
          [VisualizerMode.PLASMA]: new PlasmaRenderer(),
          [VisualizerMode.NEBULA]: new NebulaRenderer(),
          [VisualizerMode.LASERS]: new LasersRenderer(),
          [VisualizerMode.FLUID_CURVES]: new FluidCurvesRenderer(),
          [VisualizerMode.MACRO_BUBBLES]: new MacroBubblesRenderer(),
        };
        try {
            Object.values(renderersRef.current).forEach((r: any) => r.init && r.init(canvas));
        } catch(e) { console.error("Renderer init failed", e); }
    }

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []); // Run once on mount

  // Update Worker Configuration
  useEffect(() => {
      if (workerRef.current) {
          workerRef.current.postMessage({ 
              type: 'CONFIG', 
              mode, 
              settings: JSON.parse(JSON.stringify(settings)), 
              colors 
          });
      }
  }, [mode, settings, colors]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'RESIZE', width: w, height: h });
        } else if (!isOffscreenRef.current) {
            canvas.width = w;
            canvas.height = h;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render Loop
  useEffect(() => {
    if (!analyser) return;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const renderLoop = () => {
      analyser.getByteFrequencyData(dataArray);

      if (workerRef.current) {
          workerRef.current.postMessage({ type: 'FRAME', data: dataArray });
      } else if (!isOffscreenRef.current) {
          const canvas = canvasRef.current;
          if (canvas) {
              const ctx = canvas.getContext('2d', { alpha: false });
              if (ctx) {
                  const w = canvas.width;
                  const h = canvas.height;
                  rotationRef.current += 0.005 * settings.speed;
                  const isBeat = beatDetectorRef.current.detect(dataArray);

                  if (settings.trails) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                    ctx.fillRect(0, 0, w, h);
                  } else {
                    ctx.clearRect(0, 0, w, h);
                  }

                  const renderer = renderersRef.current[mode];
                  if (renderer) {
                    renderer.draw(ctx, dataArray, w, h, colors, settings, rotationRef.current, isBeat);
                  }
              }
          }
      }
      requestRef.current = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    return () => cancelAnimationFrame(requestRef.current);
  }, [analyser, mode, colors, settings]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none bg-black overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className={`w-full h-full block transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default VisualizerCanvas;
