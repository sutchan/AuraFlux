/**
 * File: core/services/renderers/RippleRenderer.ts
 * Version: 1.0.0
 * Author: Sut
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

interface Ripple {
  r: number;
  alpha: number;
  color: string;
  speed: number;
  width: number;
  maxR: number;
}

export class RippleRenderer implements IVisualizerRenderer {
  private ripples: Ripple[] = [];

  init() { this.ripples = []; }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    
    // Audio metrics
    const bass = getAverage(data, 0, 10) / 255;
    
    // Spawn on beat or randomly if low activity but high sensitivity
    const autoSpawn = Math.random() > 0.98 && bass > 0.3;
    
    if ((beat || autoSpawn) && this.ripples.length < 25) {
        this.ripples.push({
            r: 0,
            alpha: 1.0,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: (settings.speed * 8) + (bass * 15),
            width: 2 + bass * 25,
            maxR: Math.max(w, h) * (0.6 + Math.random() * 0.4)
        });
    }

    // Update & Draw
    const cx = w / 2, cy = h / 2;
    
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    // Slightly darken center to create depth
    if (!settings.trails) ctx.clearRect(0, 0, w, h);
    
    for (let i = this.ripples.length - 1; i >= 0; i--) {
        const rip = this.ripples[i];
        rip.r += rip.speed * (0.5 + settings.speed * 0.5);
        
        // Fade out based on size progress
        const progress = rip.r / rip.maxR;
        rip.alpha = 1.0 - Math.pow(progress, 2);
        
        if (rip.alpha <= 0.01 || rip.r > rip.maxR) {
            this.ripples.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.arc(cx, cy, rip.r, 0, Math.PI * 2);
        ctx.lineWidth = rip.width * (1 + bass * 0.5) * (1.0 - progress * 0.5);
        ctx.strokeStyle = rip.color;
        ctx.globalAlpha = rip.alpha * (settings.glow ? 0.9 : 0.6);
        ctx.stroke();
        
        if (settings.glow) {
            ctx.shadowBlur = ctx.lineWidth * 2;
            ctx.shadowColor = rip.color;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
    
    ctx.restore();
  }
}