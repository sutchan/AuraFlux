/**
 * File: core/services/renderers/MacroBubblesRenderer.ts
 * Version: 1.1.4
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-22 21:15
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class MacroBubblesRenderer implements IVisualizerRenderer {
  private bubbles: Array<{ 
    x: number, y: number, r: number, vx: number, vy: number, 
    colorIdx: number, noiseOffset: number, sharpness: number 
  }> = [];
  
  init() {
    this.bubbles = [];
  }
  
  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    if (w <= 0 || h <= 0) return; // Robustness check
    
    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    const highs = getAverage(data, 120, 200) / 255 * settings.sensitivity;

    // Optimization: Reduced count to improve performance (Gradient fill is expensive)
    const count = settings.quality === 'high' ? 24 : settings.quality === 'med' ? 16 : 8;

    if (this.bubbles.length !== count) {
      if (this.bubbles.length > count) {
        this.bubbles = this.bubbles.slice(0, count);
      } 
      while (this.bubbles.length < count) {
        const r = 30 + Math.random() * 100;
        const distFromFocus = Math.abs(r - 80) / 60;
        const sharpness = Math.max(0.1, 1.0 - Math.pow(distFromFocus, 2));

        this.bubbles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: r,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          colorIdx: Math.floor(Math.random() * colors.length),
          noiseOffset: Math.random() * 1000,
          sharpness: sharpness
        });
      }
    }

    ctx.save();
    
    this.bubbles.forEach((p) => {
      const time = rotation * settings.speed * 0.2;
      const noiseX = Math.sin(p.y * 0.004 + time + p.noiseOffset) * 0.5;
      const noiseY = Math.cos(p.x * 0.004 + time + p.noiseOffset) * 0.5;

      p.vx = p.vx * 0.96 + noiseX * 0.15;
      p.vy = p.vy * 0.96 + noiseY * 0.15;
      p.x += p.vx * settings.speed * (1 + bass);
      p.y += p.vy * settings.speed * (1 + bass);
      
      if (p.x < -p.r) p.x = w + p.r;
      if (p.x > w + p.r) p.x = -p.r;
      if (p.y < -p.r) p.y = h + p.r;
      if (p.y > h + p.r) p.y = -p.r;

      const beatPop = beat ? 0.2 : 0;
      const dynamicR = p.r * (1 + bass * 0.2 + beatPop);
      const color = colors[p.colorIdx % colors.length];
      
      // --- Transparency Optimization (v1.1.2) ---
      // Sharper curve keeps background elements very subtle
      const contrastSharpness = Math.pow(p.sharpness, 3.5);

      const bodyGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dynamicR);
      
      // Increased Transparency:
      // Rim Alpha: Max reduced from 0.98 to 0.7 for lighter feel
      // Center Alpha: Reduced from 0.005 to 0.002 for pure glass effect
      const rimPos = 0.7 + (contrastSharpness * 0.25);
      const rimAlpha = 0.05 + (contrastSharpness * 0.65); // Max ~0.7
      const centerAlpha = 0.002 + (contrastSharpness * 0.03); 
      
      const rimHex = `${color}${Math.floor(rimAlpha * 255).toString(16).padStart(2,'0')}`;
      const centerHex = `${color}${Math.floor(centerAlpha * 255).toString(16).padStart(2,'0')}`;
      const midHex = `${color}${Math.floor(centerAlpha * 2.5 * 255).toString(16).padStart(2,'0')}`;

      bodyGradient.addColorStop(0, centerHex);
      bodyGradient.addColorStop(rimPos * 0.7, midHex); 
      bodyGradient.addColorStop(rimPos, rimHex);
      
      // Smoother fade out
      const fadeEnd = Math.min(1, rimPos + 0.15);
      bodyGradient.addColorStop(fadeEnd, `${color}00`);
      
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, dynamicR, 0, Math.PI * 2);
      ctx.fill();

      // Highlight remains bright to define the shape against transparency
      const highlightStrength = Math.min(1.0, highs * 4.0 + (beat ? 0.5 : 0));
      
      if (highlightStrength > 0.05 && contrastSharpness > 0.3) {
          const highlightOffset = dynamicR * 0.35;
          const hX = p.x - highlightOffset;
          const hY = p.y - highlightOffset;
          const hSize = dynamicR * (0.3 + (1 - contrastSharpness) * 0.2);
          const highlightGradient = ctx.createRadialGradient(hX, hY, 0, hX, hY, hSize);
          
          // Crisp white highlights
          const hAlpha = highlightStrength * (0.5 + contrastSharpness * 0.5);
          
          highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${hAlpha})`);
          highlightGradient.addColorStop(0.3 * contrastSharpness, `rgba(255, 255, 255, ${hAlpha * 0.5})`);
          highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
          
          ctx.fillStyle = highlightGradient;
          ctx.beginPath();
          ctx.arc(hX, hY, hSize, 0, Math.PI * 2);
          ctx.fill();
      }
    });

    ctx.restore();
  }
}