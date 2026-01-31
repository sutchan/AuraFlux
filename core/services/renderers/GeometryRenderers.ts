/**
 * File: core/services/renderers/GeometryRenderers.ts
 * Version: 1.8.23
 * Author: Sut
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

interface RingData {
    z: number; scale: number; alpha: number; lineWidth: number; color: string;
    points: { x: number, y: number }[];
}

export class TunnelRenderer implements IVisualizerRenderer {
  private sinCache: Float32Array = new Float32Array(0);
  private cosCache: Float32Array = new Float32Array(0);

  init() { this.sinCache = new Float32Array(0); this.cosCache = new Float32Array(0); }

  private updateCache(sides: number) {
    if (this.sinCache.length === sides + 1) return;
    this.sinCache = new Float32Array(sides + 1);
    this.cosCache = new Float32Array(sides + 1);
    for (let j = 0; j <= sides; j++) {
      const theta = (j / sides) * Math.PI * 2;
      this.sinCache[j] = Math.sin(theta);
      this.cosCache[j] = Math.cos(theta);
    }
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0 || w <= 0 || h <= 0) return;
    const cx = w / 2, cy = h / 2, minDim = Math.min(w, h);
    const rings = settings.quality === 'high' ? 24 : (settings.quality === 'med' ? 18 : 12);
    const sides = settings.quality === 'high' ? 32 : (settings.quality === 'med' ? 24 : 16);
    this.updateCache(sides);
    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    const fov = Math.max(w, h) * 0.9, zSpacing = 160, maxDepth = rings * zSpacing, virtualTime = rotation * 1000; 
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.fillStyle = '#000000'; ctx.globalCompositeOperation = 'source-over';
    let sX = 0, sY = 0; if (beat) { const f = 15 * settings.sensitivity; sX = (Math.random()-0.5)*f; sY = (Math.random()-0.5)*f; }
    ctx.translate(cx + sX, cy + sY); ctx.rotate(rotation * 0.1); 
    const coreSize = (minDim * 0.05 + bass * (minDim * 0.2));
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
    grad.addColorStop(0, colors[2] || colors[0]); grad.addColorStop(0.4, `${colors[1]}60`); grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, coreSize, 0, Math.PI * 2); ctx.fill();
    const ringList: RingData[] = [];
    const baseR = minDim * 0.35, audioAmp = minDim * 0.25 * settings.sensitivity;
    for (let i = 0; i < rings; i++) {
        let z = (i * zSpacing - virtualTime) % maxDepth; if (z < 0) z += maxDepth; if (z < 10) continue; 
        const scale = fov / (fov + z);
        const finalAlpha = Math.pow(1.0 - (z / maxDepth), 1.5) * Math.min(1.0, (z - 10) / 200) * (0.6 + bass * 0.4);
        if (finalAlpha < 0.01) continue;
        const twist = z * 0.0015 - rotation * 0.5, cT = Math.cos(twist), sT = Math.sin(twist);
        const lineWidth = Math.max(1.0, 12.0 * Math.pow(scale, 2.5) * (1 + bass * 0.5));
        const points: {x: number, y: number}[] = [];
        for (let j = 0; j < sides; j++) {
            const r = (baseR + (data[Math.floor((j/sides)*40)] / 255) * audioAmp) * scale;
            points.push({ x: (this.cosCache[j]*cT - this.sinCache[j]*sT) * r, y: (this.cosCache[j]*sT + this.sinCache[j]*cT) * r });
        }
        ringList.push({ z, scale, alpha: finalAlpha, lineWidth, color: colors[i % colors.length], points });
    }
    ringList.sort((a, b) => b.z - a.z);
    for (let i = 0; i < ringList.length; i++) {
        const curr = ringList[i], next = ringList[i + 1]; 
        if (next && (curr.z - next.z) < zSpacing * 1.5) {
            ctx.beginPath(); ctx.lineWidth = (curr.lineWidth + next.lineWidth) / 2; ctx.strokeStyle = curr.color; ctx.globalAlpha = Math.min(curr.alpha, next.alpha) * 0.8;
            for (let j = 0; j < sides; j++) { ctx.moveTo(curr.points[j].x, curr.points[j].y); ctx.lineTo(next.points[j].x, next.points[j].y); }
            if (settings.glow) { ctx.shadowBlur = ctx.lineWidth * 4; ctx.shadowColor = curr.color; }
            ctx.stroke(); ctx.shadowBlur = 0;
        }
        ctx.beginPath(); const p0 = curr.points[0]; ctx.moveTo(p0.x, p0.y);
        for (let j = 1; j < curr.points.length; j++) ctx.lineTo(curr.points[j].x, curr.points[j].y);
        ctx.closePath(); ctx.lineWidth = curr.lineWidth; ctx.strokeStyle = curr.color; ctx.globalAlpha = curr.alpha;
        if (settings.glow) { ctx.shadowBlur = curr.lineWidth * 5; ctx.shadowColor = curr.color; }
        ctx.stroke(); ctx.shadowBlur = 0;
    }
    ctx.restore();
  }
}