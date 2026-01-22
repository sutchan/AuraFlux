/**
 * File: core/services/renderers/NebulaRenderer.ts
 * Version: 1.8.1
 * Author: Sut
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 * Updated: 2025-02-22 10:00
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

const EPSILON = 0.0001;
const MAX_CLUSTERS = 8;

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
  clusterIdx: number; // 所属集群索引，-1 表示游离态
}

export class NebulaRenderer implements IVisualizerRenderer {
  private particles: NebulaParticle[] = [];
  private clusters: NebulaCluster[] = [];
  private spriteCache: Record<string, OffscreenCanvas | HTMLCanvasElement> = {};
  private readonly MAX_SPRITE_CACHE = 128;
  private beatImpact = 0; 
  private lastBeatTime = 0;

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
            driftX: (Math.random() - 0.5) * 0.5,
            driftY: (Math.random() - 0.5) * 0.5
        });
    }
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
      g.addColorStop(0, `${color}22`);
      g.addColorStop(0.4, `${color}0c`);
      g.addColorStop(0.8, `${color}03`);
      g.addColorStop(1, `${color}00`);
    } else {
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.2, color);
      g.addColorStop(0.6, `${color}1a`);
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
    const isGas = Math.random() > 0.3;
    
    // 85% 概率归属于某个集群，15% 概率为全屏游离星尘
    const isWanderer = Math.random() > 0.85;
    p.clusterIdx = isWanderer ? -1 : Math.floor(Math.random() * this.clusters.length);

    const angle = Math.random() * Math.PI * 2;
    // 集群内半径分布更紧凑，游离态分布更广
    const orbit = isWanderer 
        ? Math.random() * Math.max(w, h) 
        : Math.pow(Math.random(), 1.8) * Math.max(w, h) * 0.45;

    p.type = isGas ? 'GAS' : 'DUST';
    
    const startX = p.clusterIdx === -1 ? (Math.random() * w) : this.clusters[p.clusterIdx].x;
    const startY = p.clusterIdx === -1 ? (Math.random() * h) : this.clusters[p.clusterIdx].y;

    p.x = startX + Math.cos(angle) * orbit;
    p.y = startY + Math.sin(angle) * orbit;
    p.life = 0;
    p.maxLife = isGas ? 5000 + Math.random() * 7000 : 3000 + Math.random() * 4000;
    p.colorIndex = Math.floor(Math.random() * Math.max(1, colorsCount));
    p.colorShift = Math.random();
    p.noiseOffset = Math.random() * 5000;
    p.baseSize = isGas ? (w * 0.3 + Math.random() * w * 0.4) : (1.0 + Math.random() * 4);
    p.angle = angle;
    p.orbitRadius = orbit;
    p.rotationSpeed = (Math.random() - 0.5) * 0.0015;
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (w <= 0 || h <= 0) return; // Robustness check
    
    const safeColors = colors.length > 0 ? colors : ['#4433ff', '#ff00aa'];
    
    if (this.clusters.length === 0) this.initClusters(w, h);

    const bass = Math.pow(getAverage(data, 0, 15) / 255, 1.2) * settings.sensitivity;
    const mid = getAverage(data, 20, 120) / 255 * settings.sensitivity;
    const treble = Math.pow(getAverage(data, 130, 255) / 255, 1.5) * settings.sensitivity;

    if (beat) {
        this.beatImpact = 1.0;
        // 节拍触发时，随机让一个集群“瞬移”，产生剧烈的位置变动感
        const unluckyCluster = Math.floor(Math.random() * MAX_CLUSTERS);
        this.clusters[unluckyCluster].x = Math.random() * w;
        this.clusters[unluckyCluster].y = Math.random() * h;
    }
    this.beatImpact *= 0.92;

    // 更新集群漂移
    this.clusters.forEach(c => {
        c.x += c.driftX * (1 + bass * 5);
        c.y += c.driftY * (1 + bass * 5);
        // 边缘回弹
        if (c.x < 0 || c.x > w) c.driftX *= -1;
        if (c.y < 0 || c.y > h) c.driftY *= -1;
    });

    const maxParticles = settings.quality === 'high' ? 240 : settings.quality === 'med' ? 120 : 60;

    while (this.particles.length < maxParticles) {
      const p = {} as NebulaParticle;
      this.resetParticle(p, w, h, safeColors.length);
      p.life = Math.random() * p.maxLife;
      this.particles.push(p);
    }

    ctx.save();
    
    // 背景层：极低饱和度的宇宙微波映射
    const bgGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h));
    bgGrad.addColorStop(0, `${safeColors[0]}1a`);
    bgGrad.addColorStop(0.6, `${safeColors[1]}05`);
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life += 1.0 * (1 + bass * 0.3);

      if (p.life > p.maxLife) {
        this.resetParticle(p, w, h, safeColors.length);
      }

      const lifeRatio = p.life / p.maxLife;
      const opacityEnv = Math.sin(lifeRatio * Math.PI); 

      // 动力学计算
      if (p.clusterIdx !== -1) {
          const c = this.clusters[p.clusterIdx];
          const orbitSpeed = (p.rotationSpeed) * (1 + mid * 2) * (1 + bass);
          p.angle += orbitSpeed;
          
          const expansion = 1.0 + (bass * 0.05);
          const tx = c.x + Math.cos(p.angle) * p.orbitRadius * expansion;
          const ty = c.y + Math.sin(p.angle) * p.orbitRadius * expansion;
          
          const ease = p.type === 'GAS' ? 0.02 : 0.07;
          p.x += (tx - p.x) * ease;
          p.y += (ty - p.y) * ease;
      } else {
          // 游离粒子：简单的直线漂移
          p.x += Math.cos(p.angle) * (0.5 + mid * 2);
          p.y += Math.sin(p.angle) * (0.5 + mid * 2);
          // 游离态容易飞出屏幕，加速回收
          if (p.x < -100 || p.x > w + 100 || p.y < -100 || p.y > h + 100) p.life = p.maxLife;
      }

      const colorIdx = Math.floor((p.colorShift * 0.6 + lifeRatio * 0.4) * (safeColors.length - 1));
      const activeColor = safeColors[colorIdx] || safeColors[0];
      const sprite = this.getSprite(activeColor, p.type);
      
      let finalSize = p.baseSize;
      let alpha = 0;

      if (p.type === 'GAS') {
        finalSize *= (0.8 + bass * 0.8 + this.beatImpact * 0.5);
        alpha = (0.12 + mid * 0.3) * opacityEnv;
      } else {
        const twinkle = Math.sin(rotation * 8 + p.noiseOffset) * 0.5 + 0.5;
        finalSize *= (1 + treble * 2.5 + this.beatImpact * 1.5);
        alpha = (0.3 + treble * 0.6 + this.beatImpact * 0.8) * opacityEnv * (0.4 + twinkle * 0.6);
      }

      if (alpha < 0.005) continue;

      ctx.globalAlpha = Math.min(0.95, alpha);
      ctx.drawImage(sprite as any, p.x - finalSize / 2, p.y - finalSize / 2, finalSize, finalSize);
    }

    // 绘制随机出现的引力微透镜（视觉上的深黑色小洞，增加空寂感）
    if (this.beatImpact > 0.5) {
        ctx.globalCompositeOperation = 'destination-out';
        const holeX = this.clusters[0].x;
        const holeY = this.clusters[0].y;
        const holeR = 40 * this.beatImpact;
        const g = ctx.createRadialGradient(holeX, holeY, 0, holeX, holeY, holeR);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(holeX, holeY, holeR, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
  }
}