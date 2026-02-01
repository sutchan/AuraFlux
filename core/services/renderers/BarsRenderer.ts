/**
 * File: core/services/renderers/BarsRenderer.ts
 * Version: 1.9.4
 * Author: Sut
  */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage, applySoftCompression } from '../audioUtils';

export class BarsRenderer implements IVisualizerRenderer {
  private peaksL: number[] = [];
  private peaksR: number[] = [];

  init() {
    this.peaksL = [];
    this.peaksR = [];
  }

  private drawRoundedRect(ctx: RenderContext, x: number, y: number, width: number, height: number, radius: number) {
    if (height < 0.1) return;
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  private getBarProps(data: Uint8Array, peaks: number[], index: number, total: number, h: number, dropRate: number, sensitivity: number) {
      const len = data.length;
      const t = index / total;
      // Power-law sampling (0% to 75% of spectrum)
      const startBin = Math.floor(Math.pow(t, 1.5) * len * 0.75);
      const endBin = Math.floor(Math.pow((index + 1) / total, 1.5) * len * 0.75);
      
      const rawValue = getAverage(data, startBin, Math.max(startBin + 1, endBin)) / 255;
      
      // v1.9.4: Reduced overall gain by 50% to prevent over-saturation and allow more headroom
      const effectiveSensitivity = sensitivity * 0.5;
      const compressedValue = applySoftCompression(rawValue, 0.7) * effectiveSensitivity;
      
      const targetHeight = Math.min(compressedValue * h * 0.65, h * 0.8);
      
      if (targetHeight > peaks[index]) peaks[index] = targetHeight; 
      else peaks[index] = Math.max(0, peaks[index] - dropRate); 
      
      return { bar: targetHeight, peak: peaks[index] };
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean, dataR?: Uint8Array) {
    if (data.length === 0) return;
    const barCount = 32;
    const halfCount = 16;
    const centerX = w / 2;
    
    if (this.peaksL.length !== halfCount) this.peaksL = new Array(halfCount).fill(0);
    if (this.peaksR.length !== halfCount) this.peaksR = new Array(halfCount).fill(0);

    // Dynamic drop rate based on height and sensitivity
    const dropRate = (h * 0.008) * (1.0 + (settings.sensitivity * 0.15)); 
    const slotWidth = (w * 0.9) / barCount;
    const barWidth = slotWidth * 0.75;
    const barSpacing = slotWidth * 0.25;

    const c0 = colors[0] || '#ffffff';
    const c1 = colors[1] || c0;

    for (let i = 0; i < halfCount; i++) {
        const offset = i * slotWidth + barSpacing / 2;
        const radius = barWidth * 0.4;
        const capH = Math.max(2, h * 0.004);

        const left = this.getBarProps(data, this.peaksL, i, halfCount, h, dropRate, settings.sensitivity);
        const right = dataR ? this.getBarProps(dataR, this.peaksR, i, halfCount, h, dropRate, settings.sensitivity) : left;

        const barGrad = ctx.createLinearGradient(0, h * 0.8, 0, h * 0.2);
        barGrad.addColorStop(0, c0);
        barGrad.addColorStop(1, c1);
        ctx.fillStyle = barGrad;

        // Left Side
        const xL = centerX - offset - barWidth;
        this.drawRoundedRect(ctx, xL, (h - left.bar) / 2, barWidth, left.bar, radius);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.drawRoundedRect(ctx, xL, (h - left.peak) / 2 - capH * 2, barWidth, capH, 1);
        ctx.fillStyle = barGrad;

        // Right Side
        const xR = centerX + offset;
        this.drawRoundedRect(ctx, xR, (h - right.bar) / 2, barWidth, right.bar, radius);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.drawRoundedRect(ctx, xR, (h - right.peak) / 2 - capH * 2, barWidth, capH, 1);
        ctx.fillStyle = barGrad;
    }
  }
}