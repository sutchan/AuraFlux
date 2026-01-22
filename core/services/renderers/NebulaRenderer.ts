/**
 * File: core/services/renderers/NebulaRenderer.ts
 * Version: 1.8.4
 * Author: Sut
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 * Updated: 2025-02-23 04:30
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

const MAX_CLUSTERS = 3; 

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
    const key = `${color}_${type}_v2`; 
    if (this.spriteCache[key]) return this.spriteCache[key];

    if (Object.keys(this.spriteCache).length >= this.MAX_SPRITE_CACHE) {
      this.spriteCache = {};
    }

    const size = type === 'GAS' ? 128 : 32;
    const canvas = createBufferCanvas(size, size);
    const ctx = canvas.getContext('2d') as any;
    if (!ctx) return canvas;

    const center = size / 2;
    const g = ctx.createRadialGradient(center, center, 0, center, center, center);

    if (type === 'GAS') {
      g.addColorStop(0, `${color}60`); 
      g.addColorStop(0.3, `${color}20`);
      g.addColorStop(0.6, `${color}05`);
      g.addColorStop(1, '#00000000'); 
    } else {
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.15, color);
      g.addColorStop(0.4, `${color}00`); 
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
    // Optimization: More dust/stars (70%), fewer massive gas clouds (30%) to allow higher particle counts
    const isGas = Math.random() > 0.7; 
    
    // Feature: More randomly drifting particles (40%) to fill the void
    const isWanderer = Math.random() > 0.6; 
    p.clusterIdx = isWanderer ? -1 : Math.floor(Math.random() * this.clusters.length);

    const angle = Math.random() * Math.PI * 2;
    const orbit = Math.pow(Math.random(), 2.0) * Math.max(w, h) * 0.45; 

    p.type = isGas ? 'GAS' : 'DUST';
    
    // Spawn Logic: Wanderers start anywhere on screen, Clusters start relative to center
    if (p.clusterIdx === -1) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
        // Wanderers use rotationSpeed as linear velocity scalar
        p.rotationSpeed = 0.3 + Math.random() * 0.8;
    } else {
        const c = this.clusters[p.clusterIdx];
        p.x = c.x + Math.cos(angle) * orbit;
        p.y = c.y + Math.sin(angle) * orbit;
        // Orbiters use rotationSpeed as angular velocity
        p.rotationSpeed = (Math.random() - 0.5) * 0.002;
    }

    p.life = 0;
    p.maxLife = isGas ? 3000 + Math.random() * 4000 : 1500 + Math.random() * 2000;
    p.colorIndex = Math.floor(Math.random() * Math.max(1, colorsCount));
    p.colorShift = Math.random();
    p.noiseOffset = Math.random() * 5000;
    
    p.baseSize = isGas ? (w * 0.5 + Math.random() * w * 0.5) : (3.0 + Math.random() * 6);
    
    p.angle = angle;
    p.orbitRadius = orbit;
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (w <= 0 || h <= 0) return; 
    
    const safeColors = colors.length > 0 ? colors : ['#4433ff', '#ff00aa'];
    
    if (this.clusters.length === 0) this.initClusters(w, h);

    const bass = Math.pow(getAverage(data, 0, 15) / 255, 1.5) * settings.sensitivity; 
    const treble = Math.pow(getAverage(data, 130, 255) / 255, 1.5) * settings.sensitivity;

    if (beat) {
        this.beatImpact = 1.0;
        if (this.clusters[0]) {
             this.clusters[0].x += (Math.random()-0.5) * 20;
             this.clusters[0].y += (Math.random()-0.5) * 20;
        }
    }
    this.beatImpact *= 0.92;

    this.clusters.forEach(c => {
        c.x += c.driftX * (1 + bass * 2);
        c.y += c.driftY * (1 + bass * 2);
        if (c.x < -w*0.2 || c.x > w*1.2) c.driftX *= -1;
        if (c.y < -h*0.2 || c.y > h*1.2) c.driftY *= -1;
    });

    // Updated Particle Limits: Significantly increased for richer visuals
    const maxParticles = settings.quality === 'high' ? 150 : settings.quality === 'med' ? 100 : 50;

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
    
    // Deep Space Background
    ctx.fillStyle = '#050508'; 
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life += 1.0 * (1 + bass * 0.5);

      if (p.life > p.maxLife) {
        this.resetParticle(p, w, h, safeColors.length);
      }

      const lifeRatio = p.life / p.maxLife;
      const opacityEnv = Math.sin(lifeRatio * Math.PI); 

      // Movement Physics
      if (p.clusterIdx !== -1 && this.clusters[p.clusterIdx]) {
          // Orbiting Logic
          const c = this.clusters[p.clusterIdx];
          p.angle += p.rotationSpeed * (1 + bass * 2);
          const r = p.orbitRadius * (1.0 + Math.sin(rotation + p.noiseOffset) * 0.1);
          const tx = c.x + Math.cos(p.angle) * r;
          const ty = c.y + Math.sin(p.angle) * r;
          p.x += (tx - p.x) * 0.05;
          p.y += (ty - p.y) * 0.05;
      } else {
          // Drifting Logic (Wanderers)
          const driftSpeed = p.rotationSpeed * settings.speed * (1 + bass * 0.5);
          p.x += Math.cos(p.angle) * driftSpeed;
          p.y += Math.sin(p.angle) * driftSpeed;
      }

      const colorIdx = Math.floor((p.colorShift + i * 0.1) % safeColors.length);
      const activeColor = safeColors[colorIdx];
      const sprite = this.getSprite(activeColor, p.type);
      
      let finalSize = p.baseSize;
      let alpha = 0;

      if (p.type === 'GAS') {
        finalSize *= (0.9 + bass * 0.4 + this.beatImpact * 0.2);
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

    if (this.beatImpact > 0.1) {
        ctx.globalCompositeOperation = 'lighter'; 
        const flashGradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w * 0.8);
        flashGradient.addColorStop(0, `rgba(255,255,255,${this.beatImpact * 0.15})`);
        flashGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = flashGradient;
        ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }
}