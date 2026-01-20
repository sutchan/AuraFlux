
import React, { useRef, useEffect } from 'react';
import { VisualizerMode, VisualizerSettings, IVisualizerRenderer } from '../../core/types/index';
import { createVisualizerRenderers, BeatDetector } from '../../core/services/visualizerStrategies';

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
  const requestRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);

  useEffect(() => {
    // DRY Principle: Use the same factory as the Web Worker
    renderersRef.current = createVisualizerRenderers();
    
    // Initialize all renderers if they have an init method
    // Note: We don't pass canvas here yet, as it might resize. 
    // Renderers that need canvas context usually get it in draw() or lazily.
    Object.values(renderersRef.current).forEach((r) => r.init && r.init(null));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const render = () => {
      // Handle resize
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const width = canvas.width;
      const height = canvas.height;

      analyser.getByteFrequencyData(dataArray);
      
      const isBeat = beatDetectorRef.current.detect(dataArray);
      rotationRef.current += 0.005 * settings.speed;

      // Clear or Trails
      if (settings.trails) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      const renderer = renderersRef.current[mode];
      if (renderer) {
        try {
          renderer.draw(ctx, dataArray, width, height, colors, settings, rotationRef.current, isBeat);
        } catch (e) {
          // Suppress renderer errors in animation loop to prevent crash spam
          if (Math.random() < 0.001) console.error("Renderer error:", e);
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [analyser, mode, colors, settings]);

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
