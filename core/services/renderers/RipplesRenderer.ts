
/**
 * File: core/services/renderers/RipplesRenderer.ts
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

interface Ripple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
  speed: number;
  color: string;
  lineWidth: number;
  active: boolean;
}

export class RipplesRenderer implements IVisualizerRenderer {
  private ripples: Ripple[] = [];
  private readonly MAX_RIPPLES = 60;

  init() {
    this.ripples = [];
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;

    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    const mids = getAverage(data, 20, 100) / 255 * settings.sensitivity;
    const treble = getAverage(data, 100, 200) / 255 * settings.sensitivity;

    // Spawn new ripples based on audio events
    const spawnRipple = (isBass: boolean) => {
        // Reuse inactive ripples first to reduce GC
        let ripple = this.ripples.find(r => !r.active);
        if (!ripple && this.ripples.length < this.MAX_RIPPLES) {
            ripple = { x: 0, y: 0, r: 0, maxR: 0, alpha: 0, speed: 0, color: '', lineWidth: 0, active: false };
            this.ripples.push(ripple);
        }

        if (ripple) {
            ripple.active = true;
            ripple.x = Math.random() * w;
            ripple.y = Math.random() * h;
            ripple.r = 0;
            
            if (isBass) {
                // Bass ripple: Large, slow, center-biased
                ripple.maxR = Math.max(w, h) * 0.4 * (1 + bass);
                ripple.speed = 2 + bass * 2;
                ripple.lineWidth = 3 + bass * 5;
                ripple.color = colors[0];
                ripple.alpha = 0.8;
                // Bias towards center for bass
                if (Math.random() > 0.5) {
                    ripple.x = w / 2 + (Math.random() - 0.5) * w * 0.2;
                    ripple.y = h / 2 + (Math.random() - 0.5) * h * 0.2;
                }
            } else {
                // Treble ripple: Small, fast, random
                ripple.maxR = Math.max(w, h) * 0.1 * (1 + treble);
                ripple.speed = 4 + treble * 4;
                ripple.lineWidth = 1 + treble * 2;
                ripple.color = colors[Math.floor(Math.random() * colors.length)];
                ripple.alpha = 0.5;
            }
            // Global speed modifier
            ripple.speed *= settings.speed;
        }
    };

    // Logic to trigger spawns
    if (beat) {
        spawnRipple(true); // Big bass ripple
        if (settings.quality === 'high') spawnRipple(true); 
    }
    
    // Treble creates rain
    if (Math.random() < treble * 0.5) {
        spawnRipple(false);
    }
    // Continuous light rain based on mids
    if (Math.random() < mids * 0.1) {
        spawnRipple(false);
    }

    // Draw Loop
    ctx.lineCap = 'round';
    
    this.ripples.forEach(p => {
        if (!p.active) return;

        p.r += p.speed;
        // Fade out as it expands relative to max radius
        const progress = p.r / p.maxR;
        // Cubic easing for fade out
        const currentAlpha = p.alpha * (1 - Math.pow(progress, 3));

        if (progress >= 1 || currentAlpha <= 0.01) {
            p.active = false;
            return;
        }

        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.lineWidth * (1 - progress); // Thin out at edges
        ctx.globalAlpha = currentAlpha;
        
        // Draw main ring
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
        
        // Optional: Draw echo ring for aesthetics (high quality only)
        if (settings.quality === 'high' && p.r > 20) {
             ctx.beginPath();
             ctx.lineWidth = p.lineWidth * 0.5;
             ctx.globalAlpha = currentAlpha * 0.5;
             ctx.arc(p.x, p.y, p.r * 0.85, 0, Math.PI * 2);
             ctx.stroke();
        }
    });
    
    ctx.globalAlpha = 1.0;
  }
}
