
/**
 * File: components/visualizers/VisualizerCanvas.tsx
 * Version: 1.1.2
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React, { useRef, useEffect } from 'react';
import { VisualizerMode, VisualizerSettings, IVisualizerRenderer } from '../../core/types/index';
import { createVisualizerRenderers, BeatDetector } from '../../core/services/visualizerStrategies';
import { applyNoiseFloor } from '../../core/services/audioUtils';

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
  const renderersRef = useRef<Record<string, IVisualizerRenderer>>({});
  const beatDetectorRef = useRef(new BeatDetector());
  const animationIdRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);

  // Performance Optimization: Ref Pattern
  // Store the latest props in a ref. This allows the requestAnimationFrame loop
  // to access the most current settings without needing to be recreated (and restarting the loop)
  // every time a slider moves or a color changes.
  const propsRef = useRef({ mode, colors, settings });

  useEffect(() => {
    propsRef.current = { mode, colors, settings };
  }, [mode, colors, settings]);

  // Initialize Renderers once on mount
  useEffect(() => {
    renderersRef.current = createVisualizerRenderers();
    // Optional: Pre-init renderers if needed
    Object.values(renderersRef.current).forEach((r) => {
      if (r.init) r.init(null);
    });
  }, []);

  // Main Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    // 'desynchronized' hint reduces latency on compatible browsers (Chrome)
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    // Allocate data array once to avoid garbage collection in the loop
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const renderLoop = () => {
      // 1. Retrieve latest state without triggering re-renders
      const { mode: currentMode, colors: currentColors, settings: currentSettings } = propsRef.current;

      // 2. Handle Canvas Resizing
      // Check client dimensions to ensure 1:1 pixel mapping for sharp rendering
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      const { width, height } = canvas;

      // 3. Audio Processing
      analyser.getByteFrequencyData(dataArray);
      
      // Noise Gate: Filter out background hum (e.g. fans, AC)
      // Threshold of 30 ensures silence looks like silence
      applyNoiseFloor(dataArray, 30);

      const isBeat = beatDetectorRef.current.detect(dataArray);
      
      // Update global rotation logic
      rotationRef.current += 0.005 * currentSettings.speed;

      // 4. Clear Screen / Apply Trails Effect
      if (currentSettings.trails) {
        // Drawing a semi-transparent black rect creates the "trail" or "motion blur" effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // 5. Delegate to Specific Strategy Renderer
      const renderer = renderersRef.current[currentMode];
      if (renderer) {
        try {
          renderer.draw(
            ctx, 
            dataArray, 
            width, 
            height, 
            currentColors, 
            currentSettings, 
            rotationRef.current, 
            isBeat
          );
        } catch (e) {
          // Suppress individual renderer errors to keep the app alive
          // console.warn("Renderer error", e);
        }
      }

      animationIdRef.current = requestAnimationFrame(renderLoop);
    };

    // Start Loop
    renderLoop();

    // Cleanup on unmount or if analyser changes
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [analyser]); // Only restart loop if the audio source itself changes

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none bg-black overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
      />
    </div>
  );
};

export default VisualizerCanvas;
