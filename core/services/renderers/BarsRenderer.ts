
/**
 * File: core/services/renderers/BarsRenderer.ts
 * Version: 1.0.6
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';

export class BarsRenderer implements IVisualizerRenderer {
  private peaks: number[] = [];

  init() {
    this.peaks = [];
  }

  // Helper for rounded rectangles
  private drawRoundedRect(ctx: RenderContext, x: number, y: number, width: number, height: number, radius: number) {
    if (height < 0.1) return; // Skip tiny rendering
    if (width < 0) width = 0;
    
    // Ensure radius doesn't exceed dimensions
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
    // 1. Configuration: Fewer bars, wider stance
    const barCount = 24; // Reduced from 56 for a chunky, retro feel
    const barWidthRatio = 0.8; // Occupy 80% of the slot width
    const step = Math.floor(data.length / (barCount * 1.5)); // Sampling step
    
    // Calculate layout
    const slotWidth = w / barCount;
    const barWidth = slotWidth * barWidthRatio;
    const barSpacing = slotWidth * (1 - barWidthRatio);
    const centerX = w / 2;
    
    // Initialize peaks if resolution changed
    const halfCount = Math.ceil(barCount / 2);
    if (this.peaks.length !== halfCount) {
        this.peaks = new Array(halfCount).fill(0);
    }

    const c0 = colors[0] || '#ffffff';
    const c1 = colors[1] || c0;
    
    // Drop speed relative to height (e.g., 0.5% of screen height per frame)
    // Adjusted by sensitivity to keep physics consistent
    const dropRate = (h * 0.005) / Math.max(0.5, settings.sensitivity * 0.5);

    for (let i = 0; i < halfCount; i++) {
        // Get Audio Value
        // Interpolate slightly for smoothness if possible, otherwise simple sample
        const dataIndex = Math.floor(i * step);
        const value = data[dataIndex] * settings.sensitivity * 1.2;
        
        // Target Height for the Bar
        const targetHeight = Math.min(Math.max((value / 255) * h * 0.7, 0), h * 0.85);
        
        // Peak Logic
        if (targetHeight > this.peaks[i]) {
            this.peaks[i] = targetHeight; // Jump up immediately
        } else {
            this.peaks[i] = Math.max(0, this.peaks[i] - dropRate); // Fall slowly
        }

        const barHeight = targetHeight;
        const peakHeight = this.peaks[i];
        
        const capHeight = 4;
        const cornerRadius = barWidth * 0.3;

        // Colors
        const gradient = ctx.createLinearGradient(0, h, 0, 0);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(0.5, c0);
        gradient.addColorStop(1, c0);

        // Positions (Symmetrical from center)
        const offset = i * slotWidth + barSpacing / 2;
        const x_right = centerX + offset;
        const x_left = centerX - offset - barWidth;
        
        // Center vertically
        const y_bar = (h - barHeight) / 2;
        const y_peak = (h - peakHeight) / 2;

        // Draw Main Bars
        if (barHeight > 1) {
            ctx.fillStyle = gradient;
            // Draw slightly lower to leave gap for cap if they were connected, 
            // but here we treat cap as floating.
            this.drawRoundedRect(ctx, x_right, y_bar, barWidth, barHeight, cornerRadius);
            this.drawRoundedRect(ctx, x_left, y_bar, barWidth, barHeight, cornerRadius);
        }

        // Draw Falling Peaks (Caps)
        if (peakHeight > 5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            // Draw cap at the peak position
            this.drawRoundedRect(ctx, x_right, y_peak - capHeight * 1.5, barWidth, capHeight, 2);
            this.drawRoundedRect(ctx, x_left, y_peak - capHeight * 1.5, barWidth, capHeight, 2);
        }
    }
  }
}
