/**
 * File: core/services/renderers/MacroBubblesRenderer.ts
 * Version: 2.1.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-25 16:00
 * Description: Optimized with Sprite Caching, Soft-Body Physics, and Instant Full-Screen Fade-In.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

// Cache configuration
const SPRITE_SIZE = 128; // High res sprite
const CACHE_LIMIT = 32;

interface BubbleParticle {
  x: number;
  y: number;
  r: number; // radius
  vx: number;
  vy: number;
  colorHex: string;
  noiseOffset: number;
  wobblePhase: number; // For soft-body deformation
  wobbleSpeed: number;
  currentAlpha: number; // For fade-in effect
}

export class MacroBubblesRenderer implements IVisualizerRenderer {
  private bubbles: BubbleParticle[] = [];
  private spriteCache: Record<string, HTMLCanvasElement | OffscreenCanvas> = {};
  
  init() {
    this.bubbles = [];
    this.spriteCache = {};
  }

  // Generate a high-fidelity soap bubble sprite
  private getSprite(color: string): HTMLCanvasElement | OffscreenCanvas {
    if (this.spriteCache[color]) return this.spriteCache[color];

    // Cleanup cache if too large
    const keys = Object.keys(this.spriteCache);
    if (keys.length > CACHE_LIMIT) delete this.spriteCache[keys[0]];

    // Create canvas
    let canvas: HTMLCanvasElement | OffscreenCanvas;
    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(SPRITE_SIZE, SPRITE_SIZE);
    } else {
      canvas = document.createElement('canvas');
      canvas.width = SPRITE_SIZE;
      canvas.height = SPRITE_SIZE;
    }

    const ctx = canvas.getContext('2d') as any; // Cast to allow simple 2d context usage
    const cx = SPRITE_SIZE / 2;
    const cy = SPRITE_SIZE / 2;
    const r = SPRITE_SIZE / 2 - 2; // Padding

    // 1. The Body (Subtle Gradient)
    // Real bubbles are mostly transparent in the middle, thicker at edges
    const grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
    grad.addColorStop(0, `${color}05`); // Very faint center
    grad.addColorStop(0.8, `${color}40`); // Semi-transparent body
    grad.addColorStop(0.95, `${color}90`); // Sharp rim
    grad.addColorStop(1, `${color}00`); // Fade out

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 2. Main Specular Highlight (Top Left - Soft & Bright)
    const h1x = cx - r * 0.4;
    const h1y = cy - r * 0.4;
    const h1r = r * 0.5;
    const gradH1 = ctx.createRadialGradient(h1x, h1y, 0, h1x, h1y, h1r);
    gradH1.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradH1.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)');
    gradH1.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradH1;
    ctx.beginPath();
    ctx.ellipse(h1x, h1y, r * 0.25, r * 0.15, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Secondary Caustic Highlight (Bottom Right - Sharp & Small)
    // This simulates light passing through the bubble
    const h2x = cx + r * 0.35;
    const h2y = cy + r * 0.35;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(h2x, h2y, r * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // 4. Subtle Inner Rim Reflection (Simulate thickness)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
    ctx.stroke();

    this.spriteCache[color] = canvas;
    return canvas;
  }
  
  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0 || w <= 0 || h <= 0) return;
    
    const bass = Math.pow(getAverage(data, 0, 10) / 255, 1.5) * settings.sensitivity;
    const treble = getAverage(data, 100, 200) / 255 * settings.sensitivity;

    // Increased count slightly due to better performance
    const count = settings.quality === 'high' ? 32 : settings.quality === 'med' ? 20 : 12;

    // Initialization / Cleanup
    if (this.bubbles.length > count) this.bubbles.splice(count);
    
    // Spawn Logic Update: 
    // Fill the screen immediately instead of waiting for bubbles to rise from bottom
    while (this.bubbles.length < count) {
      const r = 20 + Math.random() * 80;
      this.bubbles.push({
        x: Math.random() * w,
        y: Math.random() * (h * 1.2), // Distribute across full height + 20% buffer below
        r: r,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.2 - Math.random() * 0.5, // Natural buoyancy (upward)
        colorHex: colors[Math.floor(Math.random() * colors.length)],
        noiseOffset: Math.random() * 1000,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.05,
        currentAlpha: 0 // Start completely transparent for fade-in effect
      });
    }

    ctx.save();
    // 'screen' blend mode makes overlapping bubbles look brighter and glassy
    ctx.globalCompositeOperation = 'screen'; 
    
    this.bubbles.forEach((p, i) => {
      const time = performance.now() * 0.001;
      
      // --- Initial Fade In ---
      if (p.currentAlpha < 1.0) {
          p.currentAlpha += 0.03; // Smooth fade in over ~30 frames
          if (p.currentAlpha > 1.0) p.currentAlpha = 1.0;
      }

      // --- Physics: Buoyancy & Turbulence ---
      const noiseX = Math.sin(time + p.noiseOffset) * 0.3;
      
      // Update Velocity
      // Bass gives a sudden upward push (pressure wave)
      const bassLift = bass * 0.5;
      p.x += (p.vx + noiseX) * settings.speed;
      p.y += (p.vy - bassLift) * settings.speed;
      
      // Reset logic (Recycle)
      const boundary = p.r * 1.5;
      if (p.y < -boundary) {
          p.y = h + boundary; // Move to bottom
          p.x = Math.random() * w;
          p.colorHex = colors[Math.floor(Math.random() * colors.length)];
          p.currentAlpha = 1.0; // Recycled particles are already fully visible
      }
      if (p.x < -boundary) p.x = w + boundary;
      if (p.x > w + boundary) p.x = -boundary;

      // --- Soft Body Dynamics (The "Wobble") ---
      // Bubbles deform slightly as they move.
      // We calculate scaleX and scaleY using a sine wave.
      p.wobblePhase += p.wobbleSpeed + (bass * 0.2); // Bass makes them jitter
      const wobbleAmount = 0.05 + (bass * 0.1); // Intensity of wobble
      const stretch = Math.sin(p.wobblePhase) * wobbleAmount;
      
      const scaleX = 1.0 + stretch;
      const scaleY = 1.0 - stretch; // Maintain volume (roughly)

      // Audio reactive size pulse
      const beatPop = beat ? 0.15 : 0;
      const sizeMult = (1 + bass * 0.3 + beatPop);
      
      const drawW = p.r * 2 * scaleX * sizeMult;
      const drawH = p.r * 2 * scaleY * sizeMult;

      // Get Cached Sprite
      const sprite = this.getSprite(p.colorHex);

      // Treble makes them more opaque/visible (like light catching them)
      // Apply fade-in alpha here
      const audioAlpha = 0.6 + treble * 0.4;
      ctx.globalAlpha = Math.min(1, audioAlpha * p.currentAlpha);

      // Draw
      ctx.drawImage(
          sprite as any, 
          p.x - drawW / 2, 
          p.y - drawH / 2, 
          drawW, 
          drawH
      );
    });

    ctx.restore();
  }
}
