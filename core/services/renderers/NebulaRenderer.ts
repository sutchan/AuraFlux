
/**
 * File: core/services/renderers/NebulaRenderer.ts
 * Version: 1.2.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

// 兼容环境的离屏画布创建
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
  throw new Error("Canvas creation failed: Environment not supported.");
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
  colorShift: number; // 用于色彩插值
}

export class NebulaRenderer implements IVisualizerRenderer {
  private particles: NebulaParticle[] = [];
  private spriteCache: Record<string, OffscreenCanvas | HTMLCanvasElement> = {};
  private readonly MAX_SPRITE_CACHE = 128;

  init() {
    this.particles = [];
    this.spriteCache = {};
  }

  /**
   * 生成双层纹理：
   * 1. GAS: 极度模糊的气团，无边缘。
   * 2. DUST: 高亮硬核点，带微弱光晕。
   */
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
      // 模拟流体气体的超羽化边缘
      g.addColorStop(0, `${color}33`); // 20% alpha
      g.addColorStop(0.4, `${color}0c`); // 5% alpha
      g.addColorStop(1, `${color}00`);
    } else {
      // 模拟锐利星点的衍射
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
    const isGas = Math.random() > 0.4; // 60% GAS, 40% DUST
    const angle = Math.random() * Math.PI * 2;
    
    // 初始位置分布
    const orbit = 20 + Math.random() * Math.max(w, h) * 0.7;

    p.type = isGas ? 'GAS' : 'DUST';
    p.x = w / 2 + Math.cos(angle) * orbit;
    p.y = h / 2 + Math.sin(angle) * orbit;
    p.vx = 0;
    p.vy = 0;
    p.life = 0;
    // 气团更长寿，流体感更强
    p.maxLife = isGas ? 4000 + Math.random() * 4000 : 1500 + Math.random() * 2000;
    p.colorIndex = Math.floor(Math.random() * colorsCount);
    p.colorShift = Math.random();
    p.noiseOffset = Math.random() * 1000;
    // GAS 尺寸受屏幕宽度影响
    p.baseSize = isGas ? (w * 0.45 + Math.random() * w * 0.2) : (2 + Math.random() * 6);
    p.angle = angle;
    p.orbitRadius = orbit;
    p.rotationSpeed = (Math.random() - 0.5) * 0.01;
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;

    // 1. 频率解剖
    const bass = Math.pow(getAverage(data, 0, 12) / 255, 1.2) * settings.sensitivity;
    const mid = getAverage(data, 20, 100) / 255 * settings.sensitivity;
    const treble = Math.pow(getAverage(data, 100, 255) / 255, 1.5) * settings.sensitivity;

    // 动态限制粒子数以平衡性能
    const maxParticles = settings.quality === 'high' ? 150 : settings.quality === 'med' ? 80 : 40;

    while (this.particles.length < maxParticles) {
      const p = {} as NebulaParticle;
      this.resetParticle(p, w, h, colors.length);
      p.life = Math.random() * p.maxLife; // 初始随机生命周期
      this.particles.push(p);
    }

    ctx.save();
    
    // 背景脉动效果
    if (bass > 0.1) {
        ctx.fillStyle = colors[0];
        ctx.globalAlpha = bass * 0.03;
        ctx.fillRect(0, 0, w, h);
    }

    // 核心混合模式：SCREEN 确保气团融合
    ctx.globalCompositeOperation = beat && bass > 0.8 ? 'lighter' : 'screen';

    const cx = w / 2 + Math.sin(rotation * 0.1) * 30;
    const cy = h / 2 + Math.cos(rotation * 0.12) * 30;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life += 1.0 * (1 + bass * 0.5);

      if (p.life > p.maxLife) {
        this.resetParticle(p, w, h, colors.length);
      }

      // --- 流体动力学模拟 ---
      // 旋转速度受 Mid 驱动，Bass 增加不稳定性
      const vortexForce = 0.003 * (1 + mid * 2);
      p.angle += vortexForce * (p.type === 'GAS' ? 0.4 : 1.5);
      
      // 径向漂移：Bass 驱动扩张，Mid 驱动波动
      const noise = Math.sin(p.angle * 2 + rotation * 0.5 + p.noiseOffset) * 20 * mid;
      const expansion = 1.0 + (bass * 0.05); 
      p.orbitRadius = (p.orbitRadius * expansion) + noise * 0.1;
      
      // 边界回收逻辑
      if (p.orbitRadius > Math.max(w, h) * 1.5) p.orbitRadius *= 0.5;

      const tx = cx + Math.cos(p.angle) * p.orbitRadius;
      const ty = cy + Math.sin(p.angle) * p.orbitRadius;
      
      // 平滑插值物理
      p.x += (tx - p.x) * (p.type === 'GAS' ? 0.02 : 0.08);
      p.y += (ty - p.y) * (p.type === 'GAS' ? 0.02 : 0.08);

      const lifeRatio = p.life / p.maxLife;
      const opacityEnv = Math.sin(lifeRatio * Math.PI); // 淡入淡出

      // --- 多重色彩插值 ---
      // 基于 [生命周期] 和 [与中心的距离] 进行复合插值
      const dist = Math.sqrt((p.x - cx)**2 + (p.y - cy)**2);
      const distFactor = Math.min(dist / (w * 0.6), 1);
      const colorIdx = Math.floor((distFactor * 0.5 + p.colorShift * 0.5) * (colors.length - 1));
      const activeColor = colors[colorIdx] || colors[0];

      const sprite = this.getSprite(activeColor, p.type);
      
      let finalSize = p.baseSize;
      let alpha = 0;

      if (p.type === 'GAS') {
        // GAS: 低音驱动体积呼吸，中音驱动气团厚度
        finalSize *= (1 + bass * 0.4 + Math.sin(rotation + p.noiseOffset) * 0.1);
        alpha = (0.15 + mid * 0.35) * opacityEnv;
      } else {
        // DUST: 高音驱动“逃逸速度”表现（尺寸激增和闪烁）
        const twinkle = Math.sin(rotation * 8 + p.noiseOffset) * 0.5 + 0.5;
        finalSize *= (1 + treble * 3.0);
        alpha = (0.3 + treble * 0.7 + (beat ? 0.4 : 0)) * opacityEnv * (0.4 + twinkle * 0.6);
      }

      if (alpha < 0.005) continue;

      ctx.globalAlpha = Math.min(0.9, alpha);
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
