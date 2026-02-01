/**
 * File: core/services/renderers/LasersRenderer.ts
 * Version: 1.8.25
 * Author: Sut
 * Copyright (c) 2025 Aura Flux. All rights reserved.
  */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class LasersRenderer implements IVisualizerRenderer {
  init() {}
  
  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0 || data.length === 0) return;
    
    const len = data.length;
    // Normalized ranges instead of fixed indices
    const highRangeStart = Math.floor(len * 0.4);
    const bassRangeEnd = Math.floor(len * 0.05);
    const midRangeStart = Math.floor(len * 0.1);
    const midRangeEnd = Math.floor(len * 0.3);

    const highs = getAverage(data, highRangeStart, len) / 255 * settings.sensitivity;
    const bass = getAverage(data, 0, bassRangeEnd) / 255 * settings.sensitivity;
    const mids = getAverage(data, midRangeStart, midRangeEnd) / 255 * settings.sensitivity;
    
    ctx.save(); 
    ctx.globalCompositeOperation = 'screen';
    
    const origins = [
      { x: w * 0.1 + Math.sin(rotation * 0.1) * 50, y: h }, 
      { x: w * 0.9 + Math.cos(rotation * 0.1) * 50, y: h }, 
      { x: w / 2 + Math.sin(rotation * 0.2) * 80, y: h + 50 }
    ];

    origins.forEach((origin, oIdx) => {
      const beams = (oIdx === 2) ? 6 : 8; 
      for (let i = 0; i < beams; i++) {
        // Correctly map beam to a relative frequency segment
        const binIdx = Math.floor(((i / beams) * 0.4 + (oIdx * 0.2)) * len);
        const freqVal = (data[binIdx] || 0) / 255 * settings.sensitivity;
        
        const angleBase = (oIdx === 0 ? -0.1 : oIdx === 1 ? -Math.PI + 0.1 : -Math.PI/2);
        const beatSweep = beat ? 0.5 : 0;
        const sweepRange = 1.2 + bass * 0.5 + beatSweep;
        
        const angle = angleBase + Math.sin(rotation * settings.speed * (0.3 + i * 0.02) + i * 0.5) * sweepRange;
        
        const length = Math.max(w, h) * 2;
        const endX = origin.x + Math.cos(angle) * length;
        const endY = origin.y + Math.sin(angle) * length;

        const baseAlpha = (0.1 + freqVal * 0.9);
        const finalAlpha = Math.min(Math.max(baseAlpha * (0.5 + bass * 2), 0.01), 1.0);
        if (finalAlpha < 0.02) continue;

        const coreWidth = settings.sensitivity + bass * 25 + mids * 5;
        
        if (settings.quality !== 'low') {
            const glowWidth = coreWidth * (4 + highs * 6);
            const glowGradient = ctx.createLinearGradient(origin.x, origin.y, endX, endY);
            glowGradient.addColorStop(0, `${colors[i % colors.length]}33`);
            glowGradient.addColorStop(1, 'transparent');
            ctx.strokeStyle = glowGradient;
            ctx.lineWidth = glowWidth;
            ctx.globalAlpha = finalAlpha * 0.3; 
            ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(endX, endY); ctx.stroke();
        }

        const coreGradient = ctx.createLinearGradient(origin.x, origin.y, endX, endY);
        coreGradient.addColorStop(0, '#ffffff'); 
        coreGradient.addColorStop(0.05, colors[i % colors.length]);
        coreGradient.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = coreGradient;
        ctx.lineWidth = coreWidth;
        ctx.globalAlpha = finalAlpha;
        ctx.beginPath(); 
        ctx.moveTo(origin.x, origin.y); 
        ctx.lineTo(endX, endY); 
        ctx.stroke();
      }
    });
    ctx.restore();
  }
}