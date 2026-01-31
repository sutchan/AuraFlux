
/**
 * File: core/services/renderers/MacroBubblesRenderer.ts
 * Version: 2.1.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-16 18:00
 * Description: "Cellular Drift" - Refined organic biology simulation.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

const SPRITE_SIZE = 256; 
const CACHE_LIMIT = 24;

interface CellParticle {
  x: number;
  y: number;
  z: number; // Depth: 0 (far) to 1 (close)
  baseSize: number;
  vx: number;
  vy: number;
  colorHex: string;
  phase: number;
  tumbleSpeed: number;
  rotation: number;
  organelleSeed: number;
  alphaEnv: number; // For fade-in
}

export class MacroBubblesRenderer implements IVisualizerRenderer {
  private cells: CellParticle[] = [];
  private spriteCache: Record<string, OffscreenCanvas | HTMLCanvasElement> = {};
  
  init() {
    this.cells = [];
    this.spriteCache = {};
  }

  // Generate a biological cell sprite with membrane, cytoplasm, and nucleus
  private getSprite(color: string): OffscreenCanvas | HTMLCanvasElement {
    if (this.spriteCache[color]) return this.spriteCache[color];

    const keys = Object.keys(this.spriteCache);
    if (keys.length > CACHE_LIMIT) delete this.spriteCache[keys[0]];

    let canvas: OffscreenCanvas | HTMLCanvasElement;
    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(SPRITE_SIZE, SPRITE_SIZE);
    } else {
      canvas = document.createElement('canvas');
      canvas.width = SPRITE_SIZE;
      canvas.height = SPRITE_SIZE;
    }

    const ctx = canvas.getContext('2d') as any;
    const cx = SPRITE_SIZE / 2;
    const cy = SPRITE_SIZE / 2;
    const r = SPRITE_SIZE / 2 - 2;

    // 1. Membrane Glow (Outer Halo) - Softer
    const halo = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r);
    halo.addColorStop(0, `${color}00`);
    halo.addColorStop(0.6, `${color}15`); // Reduced opacity
    halo.addColorStop(1, `${color}00`);
    ctx.fillStyle = halo;
    ctx.fillRect(0,0,SPRITE_SIZE,SPRITE_SIZE);

    // 2. Cytoplasm (Main Body) - Texture
    const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.85);
    body.addColorStop(0, `${color}08`); 
    body.addColorStop(0.7, `${color}40`); 
    body.addColorStop(1, `${color}02`); 
    
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // 3. Nucleus (Dense Core) - High Contrast
    const nx = cx + (Math.random() - 0.5) * r * 0.3;
    const ny = cy + (Math.random() - 0.5) * r * 0.3;
    const nr = r * 0.22;
    
    const nucleus = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
    nucleus.addColorStop(0, `${color}FF`); // Bright center
    nucleus.addColorStop(1, `${color}30`); // Soft edge
    
    ctx.fillStyle = nucleus;
    ctx.beginPath();
    ctx.arc(nx, ny, nr, 0, Math.PI * 2);
    ctx.fill();
    
    // 4. Membrane Rim (Defined Edge)
    ctx.strokeStyle = `${color}80`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Organelles (Small specks inside)
    ctx.fillStyle = `${color}50`;
    for(let i=0; i<5; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * r * 0.55;
        const size = Math.random() * r * 0.05 + 1;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang)*dist, cy + Math.sin(ang)*dist, size, 0, Math.PI * 2);
        ctx.fill();
    }

    this.spriteCache[color] = canvas;
    return canvas;
  }
  
  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0 || w <= 0 || h <= 0) return;
    
    const bass = Math.pow(getAverage(data, 0, 10) / 255, 1.5) * settings.sensitivity;
    const mids = getAverage(data, 20, 100) / 255 * settings.sensitivity;

    // Determine particle count based on quality
    const count = settings.quality === 'high' ? 40 : settings.quality === 'med' ? 25 : 15;

    if (this.cells.length > count) this.cells.splice(count);
    
    // Spawn new cells
    while (this.cells.length < count) {
      const z = Math.random(); 
      // Size depends on Z: Front = Big, Back = Small
      const sizeBase = 40 + z * 120; 
      
      this.cells.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: z,
        baseSize: sizeBase,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        colorHex: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
        tumbleSpeed: (Math.random() - 0.5) * 0.01,
        rotation: Math.random() * Math.PI * 2,
        organelleSeed: Math.random(),
        alphaEnv: 0
      });
    }

    // Sort by Z (Depth Sorting) - Far cells first
    this.cells.sort((a, b) => a.z - b.z);

    ctx.save();
    // Use 'screen' for bioluminescent look
    ctx.globalCompositeOperation = 'screen'; 
    
    const time = performance.now() * 0.001;

    this.cells.forEach((p) => {
      // Fade in logic
      if (p.alphaEnv < 1.0) p.alphaEnv += 0.02;

      // --- Physics & Flow ---
      // Speed multiplier based on depth (Parallax)
      const depthSpeed = 0.5 + p.z * 1.5; 
      
      // Brownian / Fluid drift (Smoother)
      const noiseX = Math.sin(time * 0.4 + p.phase) * 0.2;
      const noiseY = Math.cos(time * 0.25 + p.phase) * 0.2;
      
      // Audio reaction: Mids increase turbulence
      const audioTurbulence = mids * 1.5;

      p.x += (p.vx + noiseX) * settings.speed * depthSpeed * (1 + audioTurbulence);
      p.y += (p.vy + noiseY) * settings.speed * depthSpeed * (1 + audioTurbulence);
      
      // Wrap around screen
      const margin = p.baseSize;
      if (p.x < -margin) p.x = w + margin;
      if (p.x > w + margin) p.x = -margin;
      if (p.y < -margin) p.y = h + margin;
      if (p.y > h + margin) p.y = -margin;

      // Rotation
      p.rotation += p.tumbleSpeed * (1 + bass * 2);

      // --- Rendering ---
      const sprite = this.getSprite(p.colorHex);
      
      // Pulse size with Bass
      const pulse = 1.0 + (bass * 0.25 * p.z); // Front cells pulse more
      // Add "Squash" deformation based on movement
      const squash = Math.sin(time * 1.5 + p.phase) * 0.03 * p.z;
      
      const drawW = p.baseSize * pulse * (1 + squash);
      const drawH = p.baseSize * pulse * (1 - squash);

      // Alpha logic: 
      // Reduced opacity for better layering
      const baseAlpha = 0.3 + p.z * 0.5; 
      ctx.globalAlpha = Math.min(1, baseAlpha * p.alphaEnv * 0.85);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.drawImage(sprite as any, -drawW/2, -drawH/2, drawW, drawH);
      ctx.restore();
    });

    ctx.restore();
  }
}
