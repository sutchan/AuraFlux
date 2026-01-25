/**
 * File: components/visualizers/VisualizerCanvas.tsx
 * Version: 1.1.7
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-25 19:30
 */

import React, { useRef, useEffect } from 'react';
import { VisualizerMode, VisualizerSettings, IVisualizerRenderer } from '../../core/types/index';
import { createVisualizerRenderers, BeatDetector } from '../../core/services/visualizerStrategies';
import { AdaptiveNoiseFilter } from '../../core/services/audioUtils';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const renderLoop = () => {
      const { mode: currentMode, colors: currentColors, settings: currentSettings } = propsRef.current;

      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      const { width, height } = canvas;

      analyser.getByteFrequencyData(dataArray);
      noiseFilterRef.current.process(dataArray);
      const isBeat = beatDetectorRef.current.detect(dataArray);
      
      rotationRef.current += 0.005 * currentSettings.speed;

      // 基础清理
      if (currentSettings.trails) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // --- Performance Optimization ---
      // Sprite-based or self-glowing renderers generate their own glow/gradients.
      // Applying Canvas `shadowBlur` can kill performance. We disable it for these modes.
      const isSelfGlowingMode = 
        currentMode === VisualizerMode.NEBULA || 
        currentMode === VisualizerMode.MACRO_BUBBLES ||
        currentMode === VisualizerMode.TUNNEL;

      if (currentSettings.glow && !isSelfGlowingMode) {
        // 使用第一个主题色作为发光底色
        ctx.shadowColor = currentColors[0] || '#ffffff';
        // 阴影模糊程度随灵敏度微调
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
            isBeat
          );
        } catch (e) {}
      }

      // 重置状态，防止阴影影响后续的 Layer 或 UI 绘制（如果有的话）
      ctx.shadowBlur = 0;

      animationIdRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [analyser]);

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