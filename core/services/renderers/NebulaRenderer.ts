/**
 * File: core/services/renderers/NebulaRenderer.ts
 * Version: 1.8.3
 * Author: Sut
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 * Updated: 2025-02-23 00:30
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

const MAX_CLUSTERS = 3; // Reduced clusters to concentrate visuals

const createBufferCanvas = (width: number, height: number): OffscreenCanvas | HTMLCanvasElement => {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  throw new Error("Canvas creation failed.");
};

type ParticleType = 'GAS' | 'DUST';

interface NebulaCluster {
  x: number;
  y: number;
  strength: number;
  driftX: number;
  driftY: number;
}

interface NebulaParticle {
  x: number; y: number; 
  life: number; maxLife: number; 
  size: number; baseSize: number;
  colorIndex: number;
  type: ParticleType;
  noiseOffset: number;
  angle: number;
  orbitRadius: number;
  rotationSpeed: number;
  colorShift: number;
  clusterIdx: number; 
}

export class NebulaRenderer implements IVisualizerRenderer {
  private particles: NebulaParticle[] = [];
  private clusters: NebulaCluster[] = [];
  private spriteCache: Record<string, OffscreenCanvas | HTMLCanvasElement> = {};
  private readonly MAX_SPRITE_CACHE = 64; 
  private beatImpact = 0; 

  init() {
    this.particles = [];
    this.clusters = [];
    this.spriteCache = {};
    this.beatImpact = 0;
  }

  private initClusters(w: number, h: number) {
    this.clusters = [];
    for (let i = 0; i < MAX_CLUSTERS; i++) {
        this.clusters.push({
            x: Math.random() * w,
            y: Math.random() * h,
            strength: 0.5 + Math.random() * 0.5,
            driftX: (Math.random() - 0.5) * 0.3,
            driftY: (Math.random() - 0.5) * 0.3
        });
    }
  }

  private getSprite(color: string, type: ParticleType): OffscreenCanvas | HTMLCanvasElement {
    const key = `${color}_${type}_v2`; // v2 for contrast update
    if (this.spriteCache[key]) return this.spriteCache[key];

    if (Object.keys(this.spriteCache).length >= this.MAX_SPRITE_CACHE) {
      this.spriteCache = {};
    }

    // Performance: Keep low res textures, use hardware scaling
    const size = type === 'GAS' ? 128 : 32;
    const canvas = createBufferCanvas(size, size);
    const ctx = canvas.getContext('2d') as any;
    if (!ctx) return canvas;

    const center = size / 2;
    const g = ctx.createRadialGradient(center, center, 0, center, center, center);

    if (type === 'GAS') {
      // Contrast Boost: Higher core opacity, faster falloff
      // Previous: 0.13 core -> 0.01 edge
      // New: 0.35 core -> transparent edge
      g.addColorStop(0, `${color}60`); // ~37% opacity core (Much brighter)
      g.addColorStop(0.3, `${color}20`);
      g.addColorStop(0.6, `${color}05`);
      g.addColorStop(1, '#00000000'); // Fully transparent edge
    } else {
      // Stars: Sharp, bright core
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.15, color);
      g.addColorStop(0.4, `${color}00`); // Sharp drop off
      g.addColorStop(1, '#00000000');
    }

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(center, center, center, 0, Math.PI * 2);
    ctx.fill();

    this.spriteCache[key] = canvas;
    return canvas;
  }

  private resetParticle(p: Partial<NebulaParticle>, w: number, h: number, colorsCount: number) {
    const isGas = Math.random() > 0.3; // 70% Gas, 30% Stars
    
    const isWanderer = Math.random() > 0.9;
    p.clusterIdx = isWanderer ? -1 : Math.floor(Math.random() * this.clusters.length);

    const angle = Math.random() * Math.PI * 2;
    // Tighter orbits for denser look
    const orbit = isWanderer 
        ? Math.random() * Math.max(w, h) 
        : Math.pow(Math.random(), 2.0) * Math.max(w, h) * 0.35; 

    p.type = isGas ? 'GAS' : 'DUST';
    
    const startX = p.clusterIdx === -1 ? (Math.random() * w) : this.clusters[p.clusterIdx].x;
    const startY = p.clusterIdx === -1 ? (Math.random() * h) : this.clusters[p.clusterIdx].y;

    p.x = startX + Math.cos(angle) * orbit;
    p.y = startY + Math.sin(angle) * orbit;
    p.life = 0;
    p.maxLife = isGas ? 3000 + Math.random() * 4000 : 1500 + Math.random() * 2000;
    p.colorIndex = Math.floor(Math.random() * Math.max(1, colorsCount));
    p.colorShift = Math.random();
    p.noiseOffset = Math.random() * 5000;
    
    // Increased size to compensate for lower count
    p.baseSize = isGas ? (w * 0.6 + Math.random() * w * 0.6) : (4.0 + Math.random() * 8);
    
    p.angle = angle;
    p.orbitRadius = orbit;
    p.rotationSpeed = (Math.random() - 0.5) * 0.002;
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (w <= 0 || h <= 0) return; 
    
    const safeColors = colors.length > 0 ? colors : ['#4433ff', '#ff00aa'];
    
    if (this.clusters.length === 0) this.initClusters(w, h);

    const bass = Math.pow(getAverage(data, 0, 15) / 255, 1.5) * settings.sensitivity; // Sharper bass curve
    const mid = getAverage(data, 20, 120) / 255 * settings.sensitivity;
    const treble = Math.pow(getAverage(data, 130, 255) / 255, 1.5) * settings.sensitivity;

    if (beat) {
        this.beatImpact = 1.0;
        // Shift cluster center slightly on beat
        if (this.clusters[0]) {
             this.clusters[0].x += (Math.random()-0.5) * 20;
             this.clusters[0].y += (Math.random()-0.5) * 20;
        }
    }
    this.beatImpact *= 0.92;

    this.clusters.forEach(c => {
        c.x += c.driftX * (1 + bass * 2);
        c.y += c.driftY * (1 + bass * 2);
        // Soft bounds
        if (c.x < -w*0.2 || c.x > w*1.2) c.driftX *= -1;
        if (c.y < -h*0.2 || c.y > h*1.2) c.driftY *= -1;
    });

    // Performance Update: Even lower counts for smoother high-res rendering
    // High: 60 / Med: 35 / Low: 15
    const maxParticles = settings.quality === 'high' ? 60 : settings.quality === 'med' ? 35 : 15;

    // Array trimming
    if (this.particles.length > maxParticles) {
        this.particles.splice(maxParticles);
    }

    while (this.particles.length < maxParticles) {
      const p = {} as NebulaParticle;
      this.resetParticle(p, w, h, safeColors.length);
      p.life = Math.random() * p.maxLife;
      this.particles.push(p);
    }

    ctx.save();
    
    // Contrast Update: Darker Background
    // No more washed out overlay. Deep black.
    ctx.fillStyle = '#050508'; 
    ctx.fillRect(0, 0, w, h);

    // Use screen blending for light accumulation
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life += 1.0 * (1 + bass * 0.5);

      if (p.life > p.maxLife) {
        this.resetParticle(p, w, h, safeColors.length);
      }

      const lifeRatio = p.life / p.maxLife;
      // Sine window for opacity (fade in/out)
      const opacityEnv = Math.sin(lifeRatio * Math.PI); 

      // Physics
      if (p.clusterIdx !== -1 && this.clusters[p.clusterIdx]) {
          const c = this.clusters[p.clusterIdx];
          p.angle += p.rotationSpeed * (1 + bass * 2);
          
          // Breathing orbit
          const r = p.orbitRadius * (1.0 + Math.sin(rotation + p.noiseOffset) * 0.1);
          
          const tx = c.x + Math.cos(p.angle) * r;
          const ty = c.y + Math.sin(p.angle) * r;
          
          // Smooth follow
          p.x += (tx - p.x) * 0.05;
          p.y += (ty - p.y) * 0.05;
      } else {
          p.x += Math.cos(p.angle) * 0.5;
          p.y += Math.sin(p.angle) * 0.5;
      }

      const colorIdx = Math.floor((p.colorShift + i * 0.1) % safeColors.length);
      const activeColor = safeColors[colorIdx];
      const sprite = this.getSprite(activeColor, p.type);
      
      let finalSize = p.baseSize;
      let alpha = 0;

      if (p.type === 'GAS') {
        finalSize *= (0.9 + bass * 0.4 + this.beatImpact * 0.2);
        
        // Contrast Logic:
        // Base alpha is lower (0.1), but bass boosts it significantly (up to +0.6).
        // This makes quiet parts dark and loud parts vivid.
        alpha = (0.2 + bass * 0.6 + this.beatImpact * 0.4) * opacityEnv; 
      } else {
        const twinkle = Math.sin(rotation * 10 + p.noiseOffset) * 0.5 + 0.5;
        finalSize *= (1 + treble * 3.0);
        alpha = (0.4 + treble * 0.8 + twinkle * 0.3) * opacityEnv;
      }

      if (alpha < 0.01) continue;

      ctx.globalAlpha = Math.min(1.0, alpha);
      ctx.drawImage(sprite as any, p.x - finalSize / 2, p.y - finalSize / 2, finalSize, finalSize);
    }

    // Beat Flash (Shockwave)
    if (this.beatImpact > 0.1) {
        ctx.globalCompositeOperation = 'lighter'; // Additive for the flash
        const flashGradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w * 0.8);
        flashGradient.addColorStop(0, `rgba(255,255,255,${this.beatImpact * 0.15})`);
        flashGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = flashGradient;
        ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }
}