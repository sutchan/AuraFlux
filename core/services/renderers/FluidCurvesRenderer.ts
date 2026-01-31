
/**
 * File: core/services/renderers/FluidCurvesRenderer.ts
 * Version: 1.8.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-16 14:00
 * Changes: Enhanced parallax effect with bidirectional layer movement.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class FluidCurvesRenderer implements IVisualizerRenderer {
  private layerOffsets: { phase: number; freq1: number; freq2: number; vert: number; speedMult: number; }[] = [];
  
  init() {
    this.layerOffsets = [];
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    
    // Use imported getAverage function
    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    // Optimization: Reduced layer count (5 -> 4) to reduce fill-rate pressure
    const layerCount = settings.quality === 'high' ? 4 : 3;
    const time = rotation * settings.speed;

    if (this.layerOffsets.length !== layerCount) {
      this.layerOffsets = [];
      for (let i = 0; i < layerCount; i++) {
        // --- Parallax & Shear Flow Logic ---
        // 1. Direction: Alternate directions to create "shearing" effect between gas layers.
        // Asymmetric factor (1.0 vs -0.7) feels more organic than equal opposing speeds.
        const direction = i % 2 === 0 ? 1.0 : -0.7; 
        
        // 2. Speed: Front layers (higher i) move significantly faster to create depth.
        // Base speed ramps up: 0.4 -> 1.2 -> 2.0 ...
        const baseSpeed = 0.4 + (i * 0.8); 
        const randomVar = Math.random() * 0.5;

        this.layerOffsets.push({
          phase: Math.random() * Math.PI * 2,
          // Lower frequency for wider, majestic curtains of light
          freq1: 0.0015 + Math.random() * 0.002, 
          freq2: 0.004 + Math.random() * 0.003, 
          vert: (Math.random() - 0.5) * 0.25, // Increased vertical spread
          speedMult: (baseSpeed + randomVar) * direction
        });
      }
    }

    for (let i = 0; i < layerCount; i++) {
      const color = colors[i % colors.length];
      const offsets = this.layerOffsets[i];
      const layerTime = time * offsets.speedMult;

      ctx.fillStyle = color;
      
      const beatAlpha = beat ? 0.2 : 0;
      ctx.globalAlpha = 0.2 + bass * 0.3 + beatAlpha;
      
      // Optimization: Reduced segments (20 -> 16)
      const segments = 16;
      const step = w / segments;
      const points = [];

      for (let s = 0; s <= segments; s++) {
        const x = s * step;
        const offset = Math.sin(x * offsets.freq1 + layerTime + offsets.phase) * (h * 0.15);
        const audioBump = Math.cos(x * offsets.freq2 + layerTime * 1.5 + offsets.phase) * (bass * 180);
        const y = h * (0.4 + i * 0.08 + offsets.vert) + offset + audioBump;
        points.push({ x, y });
      }

      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(points[0].x, points[0].y);

      for (let j = 0; j < points.length - 1; j++) {
        const xc = (points[j].x + points[j + 1].x) / 2;
        const yc = (points[j].y + points[j + 1].y) / 2;
        ctx.quadraticCurveTo(points[j].x, points[j].y, xc, yc);
      }
      
      ctx.quadraticCurveTo(
        points[points.length - 1].x,
        points[points.length - 1].y,
        points[points.length - 1].x,
        points[points.length - 1].y
      );
      
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }
}
