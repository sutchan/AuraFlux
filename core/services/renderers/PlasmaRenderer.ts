/**
 * File: core/services/renderers/PlasmaRenderer.ts
 * Version: 1.8.23
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
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
        baseRadius: (Math.min(w, h) * 0.3) + (Math.random() * 200),
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * 100,
        colorIdx: i % colorsCount
      });
    }
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;

    const blobCount = settings.quality === 'high' ? 8 : settings.quality === 'med' ? 6 : 4;
    if (this.blobs.length !== blobCount || this.lastW !== w || this.lastH !== h) {
      this.initBlobs(w, h, blobCount, colors.length);
      this.lastW = w;
      this.lastH = h;
    }

    const bass = Math.pow(getAverage(data, 0, 15) / 255, 1.2) * settings.sensitivity;
    const mid = getAverage(data, 20, 80) / 255 * settings.sensitivity;
    const treble = Math.pow(getAverage(data, 100, 200) / 255, 1.5) * settings.sensitivity;

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
    ctx.globalCompositeOperation = 'screen';
    
    this.blobs.forEach((b, i) => {
      const driftSpeed = 0.002 * settings.speed;
      b.angle += driftSpeed * (1 + mid);
      
      const expansion = 1 + (bass * 1.2) + (beat ? 0.4 : 0);
      
      const tx = w / 2 + Math.cos(b.angle + i) * (w * 0.3 * expansion);
      const ty = h / 2 + Math.sin(b.angle * 0.8 + b.phase) * (h * 0.3 * expansion);
      
      b.vx = (tx - b.x) * 0.05;
      b.vy = (ty - b.y) * 0.05;
      b.x += b.vx;
      b.y += b.vy;

      const dynamicRadius = b.baseRadius * (0.8 + bass * 0.8 + Math.sin(rotation + b.phase) * 0.1);
      const color = colors[b.colorIdx % colors.length];

      // --- 核心修正：去除中心白点，使用主题色深浅渐变 ---
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, dynamicRadius);
      
      // 不再使用 white，直接使用主题色并调整不透明度分布
      g.addColorStop(0, color); // 中心为实色
      g.addColorStop(0.3, `${color}dd`); // 中部保持高饱和
      g.addColorStop(0.6, `${color}66`); // 边缘平滑羽化
      g.addColorStop(1, 'transparent');

      ctx.globalAlpha = 0.5 + mid * 0.5;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, dynamicRadius, 0, Math.PI * 2);
      ctx.fill();

      if (settings.quality !== 'low') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const jitter = Math.sin(rotation * 5 + b.phase) * 10;
        const innerG = ctx.createRadialGradient(b.x + jitter, b.y + jitter, 0, b.x + jitter, b.y + jitter, dynamicRadius * 0.4);
        innerG.addColorStop(0, `${color}33`);
        innerG.addColorStop(1, 'transparent');
        ctx.fillStyle = innerG;
        ctx.beginPath();
        ctx.arc(b.x + jitter, b.y + jitter, dynamicRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

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