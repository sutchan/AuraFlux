/**
 * File: core/services/renderers/RingsRenderer.ts
 * Version: 1.8.25
 * Author: Sut
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class RingsRenderer implements IVisualizerRenderer {
  private beatScale = 1.0;

  init() { this.beatScale = 1.0; }
  
  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0 || data.length === 0) return;
    
    const centerX = w / 2;
    const centerY = h / 2;
    const maxRings = 15;
    const minDimension = Math.min(w, h);
    const len = data.length;
    
    if (beat) this.beatScale = 1.2;
    this.beatScale += (1.0 - this.beatScale) * 0.1;

    const scale = Math.max(0.6, minDimension / 800) * this.beatScale; 

    for(let i = 0; i < maxRings; i++) {
        // Map ring to a percentage of the spectrum (0% to 60%)
        const centerPercent = (i / maxRings) * 0.6;
        const startBin = Math.floor(centerPercent * len);
        const endBin = Math.floor((centerPercent + 0.05) * len);
        
        const val = getAverage(data, startBin, Math.max(startBin + 1, endBin)) * settings.sensitivity;
        
        const baseR = (40 + (i * 25)) * scale;
        const audioR = Math.min(val, 150) * Math.min(scale, 1.5); 
        const radius = baseR + audioR;
        
        ctx.beginPath();
        ctx.strokeStyle = colors[i % colors.length];
        
        const beatWidthBoost = beat ? 5 : 0;
        ctx.lineWidth = ((2 + (val / 40)) * settings.sensitivity + beatWidthBoost) * scale;
        
        const startAngle = rotation * (i % 2 === 0 ? 1 : -1) + i; 
        const endAngle = startAngle + (Math.PI * 1.5) + (val / 255); 
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.stroke();
    }
  }
}