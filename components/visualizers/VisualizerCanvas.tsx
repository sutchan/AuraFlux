
/**
 * File: components/visualizers/VisualizerCanvas.tsx
 * Version: 1.2.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-12 12:00
 * Changes: Added support for stereo (analyserR).
 */

import React, { useRef, useEffect } from 'react';
import { VisualizerMode, VisualizerSettings, IVisualizerRenderer } from '../../core/types/index';
import { createVisualizerRenderers, BeatDetector } from '../../core/services/visualizerStrategies';
import { AdaptiveNoiseFilter } from '../../core/services/audioUtils';

interface VisualizerCanvasProps {
  analyser: AnalyserNode | null;
  analyserR?: AnalyserNode | null; // Optional Right Channel
  mode: VisualizerMode;
  colors: string[];
  settings: VisualizerSettings;
}

const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ 
  analyser, analyserR, mode, colors, settings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderersRef = useRef<Record<string, IVisualizerRenderer>>({});
  const beatDetectorRef = useRef(new BeatDetector());
  const noiseFilterRef = useRef(new AdaptiveNoiseFilter());
  const animationIdRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);

  const propsRef = useRef({ mode, colors, settings });

  useEffect(() => {
    propsRef.current = { mode, colors, settings };
  }, [mode, colors, settings]);

  // Init Renderers
  useEffect(() => {
    renderersRef.current = createVisualizerRenderers();
    (Object.values(renderersRef.current) as IVisualizerRenderer[]).forEach((r) => {
      if (r.init) r.init(null);
    });
  }, []);

  // Handle Resize via Observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      if (displayWidth > 0 && displayHeight > 0) {
          canvas.width = displayWidth;
          canvas.height = displayHeight;
      }
    });
    
    observer.observe(canvas);
    
    if (canvas.clientWidth > 0) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    return () => observer.disconnect();
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    // Stereo: Allocate buffer for Right channel if available
    const dataArrayR = analyserR ? new Uint8Array(analyserR.frequencyBinCount) : undefined;

    const renderLoop = () => {
      const { mode: currentMode, colors: currentColors, settings: currentSettings } = propsRef.current;
      const { width, height } = canvas;

      analyser.getByteFrequencyData(dataArray);
      noiseFilterRef.current.process(dataArray);
      const isBeat = beatDetectorRef.current.detect(dataArray);
      
      // Fetch Right Channel if available
      if (analyserR && dataArrayR) {
          analyserR.getByteFrequencyData(dataArrayR);
          // Optional: Apply noise filter to Right channel too? 
          // For now, assume Left filter state is sufficient or instantiate a second one.
          // To keep it simple and performant, we might skip filtering R or reuse L's profile implicitly.
      }

      rotationRef.current += 0.005 * currentSettings.speed;

      // Clear / Trails Logic
      if (currentSettings.trails) {
        if (currentSettings.albumArtBackground) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(0, 0, width, height);
        }
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // Glow Logic
      const isSelfGlowingMode = 
        currentMode === VisualizerMode.NEBULA || 
        currentMode === VisualizerMode.MACRO_BUBBLES ||
        currentMode === VisualizerMode.TUNNEL;

      if (currentSettings.glow && !isSelfGlowingMode) {
        ctx.shadowColor = currentColors[0] || '#ffffff';
        ctx.shadowBlur = 15 * currentSettings.sensitivity;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } else {
        ctx.shadowBlur = 0;
      }

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
            isBeat,
            dataArrayR // Pass Right Channel
          );
        } catch (e) {}
      }

      ctx.shadowBlur = 0;
      animationIdRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [analyser, analyserR]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
      />
    </div>
  );
};

export default VisualizerCanvas;
