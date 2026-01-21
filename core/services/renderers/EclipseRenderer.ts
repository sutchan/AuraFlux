
/**
 * File: core/services/renderers/EclipseRenderer.ts
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class EclipseRenderer implements IVisualizerRenderer {
  init() {}

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    const cx = w/2;
    const cy = h/2;
    const minDim = Math.min(w, h);
    const c0 = colors[0] || '#fff';
    const c1 = colors[1] || c0;
    
    const bass = getAverage(data, 0, 20) / 255 * settings.sensitivity;
    const mids = getAverage(data, 20, 100) / 255 * settings.sensitivity;
    
    const radius = minDim * 0.25;
    
    ctx.save();
    
    // 1. Corona Rays
    const rays = 60;
    const rayLen = minDim * 0.4 + (bass * minDim * 0.2);
    ctx.globalCompositeOperation = 'screen';
    
    for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2 + rotation * settings.speed * 0.2;
        // Jitter ray length with mids
        const jitter = Math.sin(i * 10 + rotation) * mids * 20;
        
        ctx.strokeStyle = i % 2 === 0 ? c0 : c1;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.1 + bass * 0.4;
        
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * (radius - 5), cy + Math.sin(angle) * (radius - 5));
        ctx.lineTo(cx + Math.cos(angle) * (rayLen + jitter), cy + Math.sin(angle) * (rayLen + jitter));
        ctx.stroke();
    }
    
    // 2. Glow behind
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.5 + bass * 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.5, 0, Math.PI*2);
    ctx.fill();
    
    // 3. Shockwave on beat
    if (beat) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.2, 0, Math.PI*2);
        ctx.stroke();
    }

    // 4. Black Core (The Eclipse)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI*2);
    ctx.fill();
    
    // Rim light
    ctx.strokeStyle = c0;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.stroke();

    ctx.restore();
  }
}
