
/**
 * File: core/services/renderers/BarsRenderer.ts
 * Version: 2.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-12 12:00
 * Changes: Stereo Support. Left channel goes left, Right channel goes right.
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
    if (width < 0) width = 0;
    const maxRadius = Math.min(width, height) / 2;
    if (radius > maxRadius) radius = maxRadius;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  // Helper to calculate bar properties
  private getBarProps(
      data: Uint8Array, 
      peaks: number[], 
      index: number, 
      step: number, 
      h: number, 
      dropRate: number, 
      sensitivity: number
  ) {
      const startBin = Math.floor(index * step);
      const rawValue = getAverage(data, startBin, startBin + step) / 255;
      const compressedValue = applySoftCompression(rawValue, 0.8) * sensitivity;
      const targetHeight = Math.min(compressedValue * h * 0.7, h * 0.85);
      
      if (targetHeight > peaks[index]) {
          peaks[index] = targetHeight; 
      } else {
          peaks[index] = Math.max(0, peaks[index] - dropRate); 
      }
      return { bar: targetHeight, peak: peaks[index] };
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean, dataR?: Uint8Array) {
    const barCount = 24; 
    const barWidthRatio = 0.8; 
    const step = Math.max(1, Math.floor(data.length / (barCount * 1.5)));
    
    const slotWidth = w / barCount;
    const barWidth = slotWidth * barWidthRatio;
    const barSpacing = slotWidth * (1 - barWidthRatio);
    const centerX = w / 2;
    
    // In stereo mode, we split the 24 bars: 12 left, 12 right? 
    // Or stick to the visual style of expanding from center.
    // Standard: HalfCount determines visual density.
    const halfCount = Math.ceil(barCount / 2);
    
    if (this.peaksL.length !== halfCount) this.peaksL = new Array(halfCount).fill(0);
    if (this.peaksR.length !== halfCount) this.peaksR = new Array(halfCount).fill(0);

    const c0 = colors[0] || '#ffffff';
    const c1 = colors[1] || c0;
    const dropRate = (h * 0.00125) / Math.max(0.5, settings.sensitivity * 0.5);

    const gradient = ctx.createLinearGradient(0, h, 0, 0);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(0.5, c0);
    gradient.addColorStop(1, c0);

    const isStereo = !!dataR;

    for (let i = 0; i < halfCount; i++) {
        const offset = i * slotWidth + barSpacing / 2;
        const cornerRadius = barWidth * 0.3;
        const capHeight = 4;

        // LEFT SIDE (Use Left Data or Mono Data)
        // Note: For stereo center-out, usually low freqs are in center.
        // So index 0 (Low) is at center.
        const leftProps = this.getBarProps(data, this.peaksL, i, step, h, dropRate, settings.sensitivity);
        
        // RIGHT SIDE (Use Right Data or Mirror Mono)
        // If mono, we mirror left data. If stereo, use dataR.
        const rightProps = isStereo 
            ? this.getBarProps(dataR!, this.peaksR, i, step, h, dropRate, settings.sensitivity)
            : { bar: leftProps.bar, peak: leftProps.peak }; // Mirror for Mono

        // Draw Left Bar (expanding left from center)
        const x_left = centerX - offset - barWidth;
        const y_bar_l = (h - leftProps.bar) / 2;
        const y_peak_l = (h - leftProps.peak) / 2;

        if (leftProps.bar > 1) {
            ctx.fillStyle = gradient;
            this.drawRoundedRect(ctx, x_left, y_bar_l, barWidth, leftProps.bar, cornerRadius);
        }
        if (leftProps.peak > 5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            this.drawRoundedRect(ctx, x_left, y_peak_l - capHeight * 1.5, barWidth, capHeight, 2);
        }

        // Draw Right Bar (expanding right from center)
        const x_right = centerX + offset;
        const y_bar_r = (h - rightProps.bar) / 2;
        const y_peak_r = (h - rightProps.peak) / 2;

        if (rightProps.bar > 1) {
            ctx.fillStyle = gradient;
            this.drawRoundedRect(ctx, x_right, y_bar_r, barWidth, rightProps.bar, cornerRadius);
        }
        if (rightProps.peak > 5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            this.drawRoundedRect(ctx, x_right, y_peak_r - capHeight * 1.5, barWidth, capHeight, 2);
        }
    }
  }
}
