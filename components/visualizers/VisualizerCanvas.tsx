/**
 * File: components/visualizers/VisualizerCanvas.tsx
 * Version: 1.8.58
 * Author: Sut
 */

import React, { useRef, useEffect } from 'react';
import { VisualizerMode, VisualizerSettings, IVisualizerRenderer } from '../../core/types/index';
import { createVisualizerRenderers, BeatDetector } from '../../core/services/visualizerStrategies';
import { AdaptiveNoiseFilter } from '../../core/services/audioUtils';

interface VisualizerCanvasProps {
  analyser: AnalyserNode | null;
  analyserR?: AnalyserNode | null; 
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

  useEffect(() => {
    renderersRef.current = createVisualizerRenderers();
    (Object.values(renderersRef.current) as IVisualizerRenderer[]).forEach((r) => {
      if (r.init) r.init(null);
    });
  }, []);

  // Responsive Sharpness Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      if (displayWidth > 0 && displayHeight > 0) {
          // Adjust for Retina/High-DPI
          if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
              canvas.width = displayWidth * dpr;
              canvas.height = displayHeight * dpr;
          }
      }
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);
    updateSize();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const dataArrayR = analyserR ? new Uint8Array(analyserR.frequencyBinCount) : undefined;

    const renderLoop = () => {
      const { mode: currentMode, colors: currentColors, settings: currentSettings } = propsRef.current;
      
      // Handle physical scale vs logical scale
      const dpr = window.devicePixelRatio || 1;
      const logicalW = canvas.width / dpr;
      const logicalH = canvas.height / dpr;

      analyser.getByteFrequencyData(dataArray);
      noiseFilterRef.current.process(dataArray);
      const isBeat = beatDetectorRef.current.detect(dataArray);
      
      if (analyserR && dataArrayR) {
          analyserR.getByteFrequencyData(dataArrayR);
      }

      rotationRef.current += 0.005 * currentSettings.speed;

      ctx.save();
      ctx.scale(dpr, dpr); // Ensure all draw calls use logical units

      // Clear / Trails Logic
      if (currentSettings.trails) {
        if (currentSettings.albumArtBackground) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(0, 0, logicalW, logicalH);
            ctx.globalCompositeOperation = 'source-over';
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(0, 0, logicalW, logicalH);
        }
      } else {
        ctx.clearRect(0, 0, logicalW, logicalH);
      }

      // Glow Logic
      const isSelfGlowingMode = 
        currentMode === VisualizerMode.NEBULA || 
        // @fix: Removed non-existent VisualizerMode.MACRO_BUBBLES
        currentMode === VisualizerMode.TUNNEL;

      if (currentSettings.glow && !isSelfGlowingMode) {
        ctx.shadowColor = currentColors[0] || '#ffffff';
        ctx.shadowBlur = 15 * currentSettings.sensitivity;
      } else {
        ctx.shadowBlur = 0;
      }

      const renderer = renderersRef.current[currentMode];
      if (renderer) {
        try {
          renderer.draw(
            ctx, 
            dataArray, 
            logicalW, 
            logicalH, 
            currentColors, 
            currentSettings, 
            rotationRef.current, 
            isBeat,
            dataArrayR 
          );
        } catch (e) {}
      }

      ctx.restore();
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