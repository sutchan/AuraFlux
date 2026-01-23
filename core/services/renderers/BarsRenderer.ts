/**
 * File: core/services/renderers/BarsRenderer.ts
 * Version: 1.2.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-25 23:00
 * Description: Optimized height calculation with soft-clipping for better high-volume dynamics.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage, applySoftCompression } from '../audioUtils';

export class BarsRenderer implements IVisualizerRenderer {
  private peaks: number[] = [];

  init() {
    this.peaks = [];
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

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    const barCount = 24; 
    const barWidthRatio = 0.8; 
    const step = Math.max(1, Math.floor(data.length / (barCount * 1.5)));
    
    const slotWidth = w / barCount;
    const barWidth = slotWidth * barWidthRatio;
    const barSpacing = slotWidth * (1 - barWidthRatio);
    const centerX = w / 2;
    
    const halfCount = Math.ceil(barCount / 2);
    if (this.peaks.length !== halfCount) {
        this.peaks = new Array(halfCount).fill(0);
    }

    const c0 = colors[0] || '#ffffff';
    const c1 = colors[1] || c0;
    const dropRate = (h * 0.00125) / Math.max(0.5, settings.sensitivity * 0.5);

    for (let i = 0; i < halfCount; i++) {
        const startBin = Math.floor(i * step);
        const rawValue = getAverage(data, startBin, startBin + step) / 255;
        
        // --- Dynamic Optimization: Soft Compression ---
        // We apply a power-curve (v^0.8) to the raw value before multiplying by sensitivity.
        // This ensures that loud signals don't instantly hit the ceiling.
        const compressedValue = applySoftCompression(rawValue, 0.8) * settings.sensitivity;
        
        // Target Height (Max 85% of screen height)
        const targetHeight = Math.min(compressedValue * h * 0.7, h * 0.85);
        
        if (targetHeight > this.peaks[i]) {
            this.peaks[i] = targetHeight; 
        } else {
            this.peaks[i] = Math.max(0, this.peaks[i] - dropRate); 
        }

        const barHeight = targetHeight;
        const peakHeight = this.peaks[i];
        const capHeight = 4;
        const cornerRadius = barWidth * 0.3;

        const gradient = ctx.createLinearGradient(0, h, 0, 0);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(0.5, c0);
        gradient.addColorStop(1, c0);

        const offset = i * slotWidth + barSpacing / 2;
        const x_right = centerX + offset;
        const x_left = centerX - offset - barWidth;
        const y_bar = (h - barHeight) / 2;
        const y_peak = (h - peakHeight) / 2;

        if (barHeight > 1) {
            ctx.fillStyle = gradient;
            this.drawRoundedRect(ctx, x_right, y_bar, barWidth, barHeight, cornerRadius);
            this.drawRoundedRect(ctx, x_left, y_bar, barWidth, barHeight, cornerRadius);
        }

        if (peakHeight > 5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            this.drawRoundedRect(ctx, x_right, y_peak - capHeight * 1.5, barWidth, capHeight, 2);
            this.drawRoundedRect(ctx, x_left, y_peak - capHeight * 1.5, barWidth, capHeight, 2);
        }
    }
  }
}
