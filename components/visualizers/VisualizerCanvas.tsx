import React, { useRef, useEffect } from 'react';
import { VisualizerMode, VisualizerSettings } from '../../core/types/index';
import { 
  BarsRenderer, RingsRenderer, FluidCurvesRenderer, MacroBubblesRenderer, 
  ParticlesRenderer, NebulaRenderer, TunnelRenderer, PlasmaRenderer, 
  LasersRenderer, BeatDetector 
} from '../../core/services/visualizerStrategies';

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
  const renderersRef = useRef<Record<string, any>>({});
  const beatDetectorRef = useRef(new BeatDetector());
  const requestRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);

  // Initialize renderers
  useEffect(() => {
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
    
    // Safe initialization with error handling
    Object.entries(renderersRef.current).forEach(([modeName, renderer]) => {
      try {
        renderer.init?.();
      } catch (e) {
        console.error(`[Visualizer] Failed to initialize ${modeName} renderer:`, e);
      }
    });
  }, []);

  // Handle canvas resize with DPR support
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      
      const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any previous transforms
        ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size setup
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main render loop
  useEffect(() => {
    if (!analyser) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const render = () => {
      const width = canvas.clientWidth;   // Use CSS dimensions for logic
      const height = canvas.clientHeight;
      
      analyser.getByteFrequencyData(dataArray);
      
      const isBeat = beatDetectorRef.current.detect(dataArray);
      rotationRef.current += 0.005 * (settings.speed || 1);

      // Clear or Trails (using CSS coordinates - ctx is scaled by DPR)
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
          console.error("Renderer error:", e);
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