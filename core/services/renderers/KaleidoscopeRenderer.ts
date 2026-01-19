
/**
 * File: core/services/renderers/KaleidoscopeRenderer.ts
 * Version: 1.0.5
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class KaleidoscopeRenderer implements IVisualizerRenderer {
  init() {}

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    // Robustness: Prevent drawing with empty or insufficient data which causes NaN/Infinity
    if (colors.length === 0 || data.length < 50) return;

    const centerX = w / 2;
    const centerY = h / 2;
    const slices = 12;
    const sliceAngle = (Math.PI * 2) / slices;
    const radius = Math.max(w, h) * 0.7;
    
    // Audio metrics
    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    // Slow global rotation plus reactive speed kick
    ctx.rotate(rotation * 0.2 + (beat ? 0.05 : 0));

    // Blending mode for vibrant overlap
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < slices; i++) {
        ctx.save();
        ctx.rotate(i * sliceAngle);
        
        // Reflect odd slices to create the mirrored kaleidoscope effect
        if (i % 2 === 1) {
            ctx.scale(1, -1);
        }
        
        const color = colors[i % colors.length];
        
        // Draw Audio Reactive Pattern
        ctx.beginPath();
        ctx.moveTo(0, 0);
        
        // Map data points along the radius
        const step = Math.floor(data.length / 50); 
        // Safety check: ensure step is at least 1 to avoid infinite loops or index 0 sticking
        const safeStep = Math.max(1, step);

        for (let j = 0; j < 30; j++) {
            // Robust access: ensure index is within bounds, fallback to 0
            const index = Math.min(j * safeStep, data.length - 1);
            const rawVal = data[index] || 0;
            const val = rawVal * settings.sensitivity;
            
            const dist = (j / 30) * radius;
            // The width of the pattern varies with audio amplitude
            const amplitude = (val / 255) * (radius / slices) * 2.5; 
            
            // Create a wavy line radiating outward
            const x = dist;
            const y = Math.sin(j * 0.8 + rotation * 2) * amplitude * 0.5;
            
            ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 1 + bass * 4;
        ctx.stroke();
        
        // Fill with low opacity for body
        ctx.fillStyle = color + '22'; 
        ctx.lineTo(radius, 0);
        ctx.lineTo(0, 0);
        ctx.fill();
        
        // Beat embellishments (Particles)
        if (beat) {
             const pDist = radius * (0.5 + Math.random() * 0.4);
             ctx.fillStyle = '#ffffff';
             ctx.beginPath();
             ctx.arc(pDist, 0, 2 + Math.random() * 3, 0, Math.PI*2);
             ctx.fill();
        }
        
        ctx.restore();
    }
    
    ctx.restore();
  }
}
