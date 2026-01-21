/**
 * File: core/services/renderers/PlasmaRenderer.ts
 * Version: 1.3.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-18 14:00
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

interface PlasmaBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  angle: number;
  phase: number;
  colorIdx: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export class PlasmaRenderer implements IVisualizerRenderer {
  private blobs: PlasmaBlob[] = [];
  private sparks: Spark[] = [];
  private lastW = 0;
  private lastH = 0;

  init() {
    this.blobs = [];
    this.sparks = [];
  }

  private initBlobs(w: number, h: number, count: number, colorsCount: number) {
    this.blobs = [];
    for (let i = 0; i < count; i++) {
      this.blobs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        radius: 0,
        // 核心优化：将基础系数从 0.15 提升至 0.3，实现直径翻倍
        baseRadius: (Math.min(w, h) * 0.3) + (Math.random() * 200),
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * 100,
        colorIdx: i % colorsCount
      });
    }
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;

    // 1. 初始化与自适应
    const blobCount = settings.quality === 'high' ? 8 : settings.quality === 'med' ? 6 : 4;
    if (this.blobs.length !== blobCount || this.lastW !== w || this.lastH !== h) {
      this.initBlobs(w, h, blobCount, colors.length);
      this.lastW = w;
      this.lastH = h;
    }

    // 2. 频率分析与通感细分
    const bass = Math.pow(getAverage(data, 0, 15) / 255, 1.2) * settings.sensitivity;
    const mid = getAverage(data, 20, 80) / 255 * settings.sensitivity;
    const treble = Math.pow(getAverage(data, 100, 200) / 255, 1.5) * settings.sensitivity;

    // 3. 高频爆发：生成电离火花
    if (treble > 0.6 || (beat && treble > 0.4)) {
      for (let i = 0; i < 3; i++) {
        const sourceBlob = this.blobs[Math.floor(Math.random() * this.blobs.length)];
        const angle = Math.random() * Math.PI * 2;
        const force = 5 + treble * 10;
        this.sparks.push({
          x: sourceBlob.x,
          y: sourceBlob.y,
          vx: Math.cos(angle) * force,
          vy: Math.sin(angle) * force,
          life: 0,
          maxLife: 20 + Math.random() * 30,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    ctx.save();
    
    // --- 核心混合模式 ---
    ctx.globalCompositeOperation = 'screen';
    
    // 4. 更新与绘制等离子体球
    this.blobs.forEach((b, i) => {
      // 非线性流体运动
      const driftSpeed = 0.002 * settings.speed;
      b.angle += driftSpeed * (1 + mid);
      
      // 核心优化：增强响应幅度，beat 时的扩张感更强
      const expansion = 1 + (bass * 1.2) + (beat ? 0.4 : 0);
      
      // 向量场更新
      const tx = w / 2 + Math.cos(b.angle + i) * (w * 0.3 * expansion);
      const ty = h / 2 + Math.sin(b.angle * 0.8 + b.phase) * (h * 0.3 * expansion);
      
      b.vx = (tx - b.x) * 0.05;
      b.vy = (ty - b.y) * 0.05;
      b.x += b.vx;
      b.y += b.vy;

      // 核心优化：动态半径倍率调整
      const dynamicRadius = b.baseRadius * (0.8 + bass * 0.8 + Math.sin(rotation + b.phase) * 0.1);
      const color = colors[b.colorIdx % colors.length];

      // --- 改进渐变算法 ---
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, dynamicRadius);
      
      const coreAlpha = 0.3 + treble * 0.7; 
      g.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha})`);
      g.addColorStop(0.08, color); 
      g.addColorStop(0.3, `${color}cc`);
      g.addColorStop(0.6, `${color}44`); 
      g.addColorStop(1, 'transparent');

      ctx.globalAlpha = 0.4 + mid * 0.6;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, dynamicRadius, 0, Math.PI * 2);
      ctx.fill();

      // 内部差分干扰纹理
      if (settings.quality !== 'low') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const jitter = Math.sin(rotation * 5 + b.phase) * 10;
        const innerG = ctx.createRadialGradient(b.x + jitter, b.y + jitter, 0, b.x + jitter, b.y + jitter, dynamicRadius * 0.4);
        innerG.addColorStop(0, `${color}44`);
        innerG.addColorStop(1, 'transparent');
        ctx.fillStyle = innerG;
        ctx.beginPath();
        ctx.arc(b.x + jitter, b.y + jitter, dynamicRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // 5. 绘制电离火花 (Sparks)
    ctx.globalCompositeOperation = 'lighter';
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life++;
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.95;
      s.vy *= 0.95;

      const alpha = 1 - (s.life / s.maxLife);
      if (alpha <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }

      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2 * alpha;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}