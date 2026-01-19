
/**
 * File: core/services/renderers/GridRenderer.ts
 * Version: 1.0.5
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class GridRenderer implements IVisualizerRenderer {
  init() {}

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;

    // Synthwave Perspective Grid
    const centerX = w / 2;
    const horizonY = h * 0.4;
    const bass = getAverage(data, 0, 15) / 255 * settings.sensitivity;
    
    // Draw Sun
    const sunRadius = (h * 0.15) * (1 + bass * 0.5);
    const sunGradient = ctx.createLinearGradient(centerX, horizonY - sunRadius, centerX, horizonY + sunRadius);
    const sunColor = colors[0];
    const skyColor = colors[1] || colors[0];
    
    sunGradient.addColorStop(0, sunColor);
    sunGradient.addColorStop(1, '#ffeb3b'); // Yellow bottom

    ctx.save();
    
    // Beat pulse for sun glow
    if (beat) {
        ctx.shadowBlur = 50 * settings.sensitivity;
        ctx.shadowColor = sunColor;
    } else if (settings.glow) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = sunColor;
    }

    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(centerX, horizonY, sunRadius, Math.PI, 0); // Top half circle
    ctx.fill();
    ctx.restore();

    // Mirror reflection of sun
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(centerX, horizonY, sunRadius, 0, Math.PI); 
    ctx.fill();
    ctx.restore();

    // Grid Logic
    const gridColor = colors[1] || '#ff00ff';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'butt';

    const speed = settings.speed * 20;
    const time = rotation * 1000;
    const offset = (time * speed) % 100;

    ctx.beginPath();

    // Vertical Lines (Perspective)
    // Audio affects the "terrain" height of lines
    const numVerticals = 20;
    const fov = w * 1.5;
    
    for (let i = -numVerticals; i <= numVerticals; i++) {
        const xPercent = i / numVerticals; // -1 to 1
        const xBase = centerX + (xPercent * w * 2); // Spread wide at bottom
        
        ctx.moveTo(centerX + (xPercent * w * 0.1), horizonY); // Vanishing point area
        
        // Draw line towards bottom
        ctx.lineTo(xBase, h);
    }

    // Horizontal Lines (Moving forward)
    // We map audio data to the curvature of horizontal lines
    const numHorizontals = 15;
    
    for (let i = 0; i < numHorizontals; i++) {
        // Logarithmic spacing for perspective
        const p = (i + (offset / 100)) / numHorizontals;
        const y = horizonY + Math.pow(p, 3) * (h - horizonY);
        
        if (y > h) continue;

        // Audio distortion
        const freqIndex = Math.floor(p * 20);
        const intensity = (data[freqIndex] || 0) / 255 * settings.sensitivity;
        const distortion = Math.sin(p * 10 + time * 0.005) * intensity * 50;

        ctx.moveTo(0, y - distortion);
        ctx.lineTo(w, y - distortion);
    }

    ctx.shadowBlur = settings.glow ? 15 : 0;
    ctx.shadowColor = gridColor;
    ctx.stroke();
    
    // Fill bottom with fade
    const fadeGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    fadeGrad.addColorStop(0, '#000000');
    fadeGrad.addColorStop(0.2, 'transparent');
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);
  }
}
