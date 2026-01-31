/**
 * File: core/services/renderers/MacroBubblesRenderer.ts
 * Version: 1.9.9
 * Author: Sut
 * Description: "Macro Bubbles" - Ultimate biological simulation with high-response multi-band physics.
 * Updated: 2025-03-25 18:30 - Finalized organic squash-and-stretch and high-frequency jitter.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage, applySoftCompression } from '../audioUtils';

const SPRITE_SIZE = 256; 
const CACHE_LIMIT = 24;

interface CellParticle {
  x: number;
  y: number;
  z: number; 
  baseSize: number;
  vx: number;
  vy: number;
  colorHex: string;
  phase: number;
  tumbleSpeed: number;
  rotation: number;
  organelleSeed: number;
  alphaEnv: number; 
}

export class MacroBubblesRenderer implements IVisualizerRenderer {
  private cells: CellParticle[] = [];
  private spriteCache: Record<string, OffscreenCanvas | HTMLCanvasElement> = {};
  
  init() {
    this.cells = [];
    this.spriteCache = {};
  }

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

    // Outer glow
    const halo = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r);
    halo.addColorStop(0, `${color}00`);
    halo.addColorStop(0.6, `${color}30`); 
    halo.addColorStop(1, `${color}00`);
    ctx.fillStyle = halo;
    ctx.fillRect(0,0,SPRITE_SIZE,SPRITE_SIZE);

    // Cell body
    const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.85);
    body.addColorStop(0, `${color}20`); 
    body.addColorStop(0.7, `${color}60`); 
    body.addColorStop(1, `${color}08`); 
    
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Nucleus (Dynamic)
    const nx = cx + (Math.random() - 0.5) * r * 0.2;
    const ny = cy + (Math.random() - 0.5) * r * 0.2;
    const nr = r * 0.25;
    
    const nucleus = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
    nucleus.addColorStop(0, `${color}FF`); 
    nucleus.addColorStop(0.4, `${color}80`); 
    nucleus.addColorStop(1, `${color}00`); 
    
    ctx.fillStyle = nucleus;
    ctx.beginPath();
    ctx.arc(nx, ny, nr, 0, Math.PI * 2);
    ctx.fill();
    
    // Membrane
    ctx.strokeStyle = `${color}BB`;
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    this.spriteCache[color] = canvas;
    return canvas;
  }
  
  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0 || w <= 0 || h <= 0) return;
    
    const len = data.length;
    // v1.9.9: High-precision extraction for maximum response
    const rawBass = getAverage(data, 0, Math.floor(len * 0.1)) / 255;
    const rawMids = getAverage(data, Math.floor(len * 0.15), Math.floor(len * 0.4)) / 255;
    const rawTreble = getAverage(data, Math.floor(len * 0.5), Math.floor(len * 0.9)) / 255;

    const bass = applySoftCompression(rawBass, 0.5) * settings.sensitivity;
    const mids = applySoftCompression(rawMids, 0.6) * settings.sensitivity;
    const treble = applySoftCompression(rawTreble, 0.7) * settings.sensitivity;
    const volume = (bass * 0.6 + mids * 0.3 + treble * 0.1);

    const count = settings.quality === 'high' ? 50 : settings.quality === 'med' ? 30 : 16;

    if (this.cells.length > count) this.cells.splice(count);
    while (this.cells.length < count) {
      const z = Math.random(); 
      this.cells.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: z,
        baseSize: 40 + z * 180,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        colorHex: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
        tumbleSpeed: (Math.random() - 0.5) * 0.04,
        rotation: Math.random() * Math.PI * 2,
        organelleSeed: Math.random(),
        alphaEnv: 0
      });
    }

    this.cells.sort((a, b) => a.z - b.z);

    ctx.save();
    ctx.globalCompositeOperation = 'screen'; 
    const time = performance.now() * 0.001;

    this.cells.forEach((p) => {
      if (p.alphaEnv < 1.0) p.alphaEnv += 0.05;

      // 1. Kinetic Drift: Speed scales with volume
      const forceFactor = 0.5 + volume * 7.0; 
      const parallax = 0.6 + p.z * 1.8; 
      
      // 2. Ultrasonic Shiver: Treble makes cells jitter microscopically
      const jitterX = treble * 10.0 * (Math.random() - 0.5); 
      const jitterY = treble * 10.0 * (Math.random() - 0.5); 

      p.x += (p.vx * forceFactor + jitterX) * settings.speed * parallax;
      p.y += (p.vy * forceFactor + jitterY) * settings.speed * parallax;
      
      const margin = p.baseSize * 2.5;
      if (p.x < -margin) p.x = w + margin;
      if (p.x > w + margin) p.x = -margin;
      if (p.y < -margin) p.y = h + margin;
      if (p.y > h + margin) p.y = -margin;

      // 3. Dynamic Rotation
      p.rotation += (p.tumbleSpeed * (1.0 + bass * 15.0)) * settings.speed;

      // 4. Elastic Heartbeat: Bass drives intense pulsing
      const beatPop = beat ? 0.5 : 0;
      const pulse = 1.0 + (bass * 1.2 + beatPop) * p.z; 
      
      // 5. Bio-Squash: Mids cause the cell to stretch horizontally or vertically
      const squashMag = 0.1 + mids * 0.4;
      const squash = Math.sin(time * 4.0 + p.phase) * squashMag;
      
      const drawW = p.baseSize * pulse * (1.0 + squash);
      const drawH = p.baseSize * pulse * (1.0 - squash);

      const baseAlpha = 0.1 + p.z * 0.8; 
      ctx.globalAlpha = Math.min(1.0, baseAlpha * p.alphaEnv * (0.5 + volume * 0.5));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      const sprite = this.getSprite(p.colorHex);
      ctx.drawImage(sprite as any, -drawW/2, -drawH/2, drawW, drawH);
      ctx.restore();
    });

    ctx.restore();
  }
}