/**
 * File: core/services/renderers/NebulaRenderer.ts
 * Version: 1.4.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-19 10:25
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

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

interface NebulaParticle {
  x: number; y: number; 
  vx: number; vy: number;
  life: number; maxLife: number; 
  size: number; baseSize: number;
  colorIndex: number;
  type: ParticleType;
  noiseOffset: number;
  angle: number;
  orbitRadius: number;
  rotationSpeed: number;
  colorShift: number;
}

export class NebulaRenderer implements IVisualizerRenderer {
  private particles: NebulaParticle[] = [];
  private spriteCache: Record<string, OffscreenCanvas | HTMLCanvasElement> = {};
  private readonly MAX_SPRITE_CACHE = 128;
  private beatImpact = 0; 
  private eventHorizonScale = 0; // 黑洞暗核半径系数

  init() {
    this.particles = [];
    this.spriteCache = {};
    this.beatImpact = 0;
    this.eventHorizonScale = 0;
  }

  private getSprite(color: string, type: ParticleType): OffscreenCanvas | HTMLCanvasElement {
    const key = `${color}_${type}`;
    if (this.spriteCache[key]) return this.spriteCache[key];

    if (Object.keys(this.spriteCache).length >= this.MAX_SPRITE_CACHE) {
      this.spriteCache = {};
    }

    const size = type === 'GAS' ? 512 : 64;
    const canvas = createBufferCanvas(size, size);
    const ctx = canvas.getContext('2d') as any;
    if (!ctx) return canvas;

    const center = size / 2;
    const g = ctx.createRadialGradient(center, center, 0, center, center, center);

    if (type === 'GAS') {
      g.addColorStop(0, `${color}33`);
      g.addColorStop(0.4, `${color}0c`);
      g.addColorStop(1, `${color}00`);
    } else {
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.1, color);
      g.addColorStop(0.5, `${color}11`);
      g.addColorStop(1, `${color}00`);
    }

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(center, center, center, 0, Math.PI * 2);
    ctx.fill();

    this.spriteCache[key] = canvas;
    return canvas;
  }

  private resetParticle(p: Partial<NebulaParticle>, w: number, h: number, colorsCount: number) {
    const isGas = Math.random() > 0.4;
    const angle = Math.random() * Math.PI * 2;
    const orbit = 20 + Math.random() * Math.max(w, h) * 0.7;

    p.type = isGas ? 'GAS' : 'DUST';
    p.x = w / 2 + Math.cos(angle) * orbit;
    p.y = h / 2 + Math.sin(angle) * orbit;
    p.vx = 0;
    p.vy = 0;
    p.life = 0;
    p.maxLife = isGas ? 4000 + Math.random() * 4000 : 1500 + Math.random() * 2000;
    p.colorIndex = Math.floor(Math.random() * colorsCount);
    p.colorShift = Math.random();
    p.noiseOffset = Math.random() * 1000;
    p.baseSize = isGas ? (w * 0.45 + Math.random() * w * 0.2) : (2 + Math.random() * 6);
    p.angle = angle;
    p.orbitRadius = orbit;
    p.rotationSpeed = (Math.random() - 0.5) * 0.005; // 旋转速度减半
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;

    // --- 动力学降速优化：所有音频物理量乘以 0.5 ---
    const bass = Math.pow(getAverage(data, 0, 12) / 255, 1.2) * settings.sensitivity * 0.5;
    const mid = getAverage(data, 20, 100) / 255 * settings.sensitivity * 0.5;
    const treble = Math.pow(getAverage(data, 100, 255) / 255, 1.5) * settings.sensitivity * 0.5;

    if (beat) this.beatImpact = 1.0;
    this.beatImpact *= 0.92;

    // 事件视界扩张逻辑
    this.eventHorizonScale = this.eventHorizonScale * 0.8 + bass * 0.2;

    const maxParticles = settings.quality === 'high' ? 150 : settings.quality === 'med' ? 80 : 40;

    while (this.particles.length < maxParticles) {
      const p = {} as NebulaParticle;
      this.resetParticle(p, w, h, colors.length);
      p.life = Math.random() * p.maxLife;
      this.particles.push(p);
    }

    ctx.save();
    
    // 超新星爆发
    if (this.beatImpact > 0.05) {
        ctx.fillStyle = colors[0];
        ctx.globalAlpha = this.beatImpact * 0.04; // 稍微降低强度以匹配静谧感
        ctx.fillRect(0, 0, w, h);
    }

    // --- 实施建议二：高频噪声增益 (CBR Grain) ---
    if (treble > 0.1) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = treble * 0.05;
        for(let g = 0; g < 100; g++) {
            const gx = Math.random() * w;
            const gy = Math.random() * h;
            ctx.fillRect(gx, gy, 1, 1);
        }
    }

    ctx.globalCompositeOperation = 'screen';

    const cx = w / 2 + Math.sin(rotation * 0.05) * 15; // 漂移速度减半
    const cy = h / 2 + Math.cos(rotation * 0.06) * 15;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life += 0.5 * (1 + bass * 0.5); // 基础生命演化减半

      if (p.life > p.maxLife) {
        this.resetParticle(p, w, h, colors.length);
      }

      // 引力波扭曲
      const spacetimeWarp = 1 + bass * 1.5; 
      const vortexForce = 0.0015 * (1 + mid * 2) * spacetimeWarp; // 基础力减半
      p.angle += vortexForce * (p.type === 'GAS' ? 0.4 : 1.5);
      
      const noise = Math.sin(p.angle * 2 + rotation * 0.25 + p.noiseOffset) * 10 * mid;
      const expansion = 1.0 + (bass * 0.04); 
      p.orbitRadius = (p.orbitRadius * expansion) + noise * 0.1;
      
      if (p.orbitRadius > Math.max(w, h) * 1.5) p.orbitRadius *= 0.5;

      const tx = cx + Math.cos(p.angle) * p.orbitRadius;
      const ty = cy + Math.sin(p.angle) * p.orbitRadius;
      
      p.x += (tx - p.x) * (p.type === 'GAS' ? 0.01 : 0.04);
      p.y += (ty - p.y) * (p.type === 'GAS' ? 0.01 : 0.04);

      const lifeRatio = p.life / p.maxLife;
      const opacityEnv = Math.sin(lifeRatio * Math.PI);

      const dist = Math.sqrt((p.x - cx)**2 + (p.y - cy)**2);
      const distFactor = Math.min(dist / (w * 0.6), 1);
      
      // --- 实施建议一：事件视界黑洞逻辑 ---
      // 越靠近中心，透明度受黑洞吸积影响越低，形成空洞感
      const horizonThreshold = Math.max(w, h) * 0.08 * (1 + this.eventHorizonScale);
      const horizonMask = smoothstep(0, horizonThreshold, dist);

      const colorIdx = Math.floor((distFactor * 0.5 + p.colorShift * 0.5) * (colors.length - 1));
      const activeColor = colors[colorIdx] || colors[0];

      const sprite = this.getSprite(activeColor, p.type);
      
      let finalSize = p.baseSize;
      let alpha = 0;

      if (p.type === 'GAS') {
        const supernovaBright = this.beatImpact * 0.5 * (1 - distFactor);
        finalSize *= (1 + bass * 0.5 + supernovaBright);
        alpha = (0.15 + mid * 0.35 + supernovaBright) * opacityEnv * horizonMask;
      } else {
        const twinkle = Math.sin(rotation * 4 + p.noiseOffset) * 0.5 + 0.5;
        finalSize *= (1 + treble * 1.5 + this.beatImpact * 1.0);
        alpha = (0.3 + treble * 0.7 + this.beatImpact * 0.6) * opacityEnv * (0.4 + twinkle * 0.6) * horizonMask;
      }

      if (alpha < 0.005) continue;

      ctx.globalAlpha = Math.min(0.95, alpha);
      ctx.drawImage(
        sprite as any, 
        p.x - finalSize / 2, 
        p.y - finalSize / 2, 
        finalSize, 
        finalSize
      );
    }

    ctx.restore();
  }
}

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}
