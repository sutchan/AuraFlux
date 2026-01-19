
/**
 * File: components/visualizers/VisualizerCanvas.tsx
 * Version: 1.0.27
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React, { useRef, useEffect, useState } from 'react';
import { VisualizerMode, VisualizerSettings } from '../../core/types/index';

// Import renderers for fallback (Main Thread) support
import { 
  BarsRenderer, RingsRenderer, FluidCurvesRenderer, MacroBubblesRenderer, 
  ParticlesRenderer, NebulaRenderer, TunnelRenderer, PlasmaRenderer, 
  LasersRenderer, BeatDetector
} from '../../core/services/visualizerStrategies';

// WORKER IMPORT FIX:
// We use a strict relative path (../../) to import the worker.
// Aliases (like @/) or root paths (like /core) can cause resolution failures in the Worker constructor.
import VisualizerWorker from '../../core/workers/visualizer.worker.ts?worker';

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
  
  // Use a key to force React to recreate the DOM element if the canvas becomes permanently detached/unusable
  const [canvasKey, setCanvasKey] = useState(0);
  
  // Transition state for smooth mode switching
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Worker State
  const workerRef = useRef<Worker | null>(null);
  const isOffscreenRef = useRef<boolean>(false);
  
  // Fallback (Main Thread) State
  const renderersRef = useRef<any>({});
  const beatDetectorRef = useRef(new BeatDetector());
  const requestRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);

  // --- Smooth Transition Logic ---
  useEffect(() => {
    // When mode changes, briefly fade out/in to hide the hard cut
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300); // 300ms fade duration
    return () => clearTimeout(timer);
  }, [mode]);

  // --- Initialization Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset offscreen flag on new mount (new canvas element due to key change or component mount)
    isOffscreenRef.current = false;

    // 1. Attempt OffscreenCanvas (Worker Mode)
    // Check if the browser supports transferring control to offscreen
    if (!!canvas.transferControlToOffscreen && !workerRef.current) {
       try {
         const offscreen = canvas.transferControlToOffscreen();
         // Mark as transferred immediately to prevent main thread interference
         isOffscreenRef.current = true;

         // Initialize worker using Vite's imported constructor
         const worker = new VisualizerWorker();
         
         worker.postMessage({ 
            type: 'INIT', 
            canvas: offscreen, 
            width: canvas.clientWidth, 
            height: canvas.clientHeight, 
            devicePixelRatio: window.devicePixelRatio || 1
         }, [offscreen]);
         
         workerRef.current = worker;
         console.log("[Visualizer] Mode: Offscreen Worker (High Performance)");
       } catch (e: any) {
         // Silently handle expected detachments in Strict Mode, warn on real errors
         const isExpectedDetach = e.message && (e.message.includes("detached") || e.message.includes("transfer"));
         
         if (isExpectedDetach) {
             console.debug("[Visualizer] Canvas detached (Strict Mode recovery). Remounting...");
             setCanvasKey(k => k + 1);
             return;
         }
         
         console.warn("[Visualizer] Worker initialization failed:", e);
         // If it's a URL/Module error, force remount to try fallback
         if (e.message && (e.message.includes("URL") || e.message.includes("module") || e.message.includes("specifier"))) {
             console.error("[Visualizer] Worker Module Error. Forcing remount...");
             setCanvasKey(k => k + 1);
             return;
         }
       }
    }

    // 2. Fallback Initialization (Main Thread Mode)
    // Only proceed if offscreen was NOT successfully transferred
    if (!isOffscreenRef.current && Object.keys(renderersRef.current).length === 0) {
        console.log("[Visualizer] Mode: Main Thread (Fallback)");
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
        } catch (e) {
            console.error("Fallback renderer init failed:", e);
        }
    }

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        // NOTE: We DO NOT set isOffscreenRef to false here. 
        // Once transferred, a canvas DOM element is permanently detached.
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [canvasKey]); // Re-run if canvasKey changes (forcing new DOM)

  // --- Resize Handler ---
  useEffect(() => {
    const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'RESIZE', width, height });
        } else if (!isOffscreenRef.current) {
            // Main thread resize
            try {
                if (canvas.width !== width || canvas.height !== height) {
                    canvas.width = width;
                    canvas.height = height;
                }
            } catch (e: any) {
                // Catch specific resize error if canvas became detached unexpectedly
                if (e.message && (e.message.includes("resize") || e.message.includes("transfer"))) {
                    // console.warn("[Visualizer] Canvas detached during resize.");
                }
            }
        }
    };
    
    window.addEventListener('resize', handleResize);
    // Trigger once to ensure correct size
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasKey]);

  // --- Configuration Sync (Worker Only) ---
  useEffect(() => {
      if (workerRef.current) {
          workerRef.current.postMessage({ 
              type: 'CONFIG', 
              mode, 
              settings: JSON.parse(JSON.stringify(settings)), // Ensure clean serialization
              colors 
          });
      }
  }, [mode, settings, colors, canvasKey]);

  // --- Render Loop ---
  useEffect(() => {
    if (!analyser) return;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const renderLoop = () => {
      analyser.getByteFrequencyData(dataArray);

      if (workerRef.current) {
          // --- Worker Path ---
          workerRef.current.postMessage({ type: 'FRAME', data: dataArray });
      } else if (!isOffscreenRef.current) {
          // --- Main Thread Path ---
          const canvas = canvasRef.current;
          if (canvas) {
              try {
                  // Ensure canvas size is correct (Main Thread)
                  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                      canvas.width = canvas.clientWidth;
                      canvas.height = canvas.clientHeight;
                  }
              
                  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
                  if (ctx) {
                      const width = canvas.width;
                      const height = canvas.height;
                      
                      rotationRef.current += 0.005 * settings.speed;
                      const isBeat = beatDetectorRef.current.detect(dataArray);

                      // Clear / Trails
                      if (settings.trails) {
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                        ctx.fillRect(0, 0, width, height);
                      } else {
                        ctx.clearRect(0, 0, width, height);
                      }

                      const renderer = renderersRef.current[mode];
                      if (renderer) {
                        renderer.draw(ctx, dataArray, width, height, colors, settings, rotationRef.current, isBeat);
                      }
                  }
              } catch (e: any) {
                  // Swallow detach errors during render loop to avoid console spam
                  // The resize/init logic handles recovery
              }
          }
      }
      requestRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [analyser, mode, colors, settings, canvasKey]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none bg-black overflow-hidden">
      <canvas 
        key={canvasKey} // Critical: Changes key to remount DOM if worker detachment fails
        ref={canvasRef} 
        className={`w-full h-full block transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default VisualizerCanvas;
