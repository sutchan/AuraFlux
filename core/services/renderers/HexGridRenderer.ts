
/**
 * File: core/services/renderers/HexGridRenderer.ts
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class HexGridRenderer implements IVisualizerRenderer {
  init() {}

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    
    // Audio features
    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    const mids = getAverage(data, 20, 100) / 255 * settings.sensitivity;
    const high = getAverage(data, 100, 200) / 255 * settings.sensitivity;

    const size = 30 + bass * 10;
    const hexH = size * 2;
    const hexW = Math.sqrt(3) * size;
    const vertDist = hexH * 0.75;
    
    // Grid calc
    const cols = Math.ceil(w / hexW) + 2;
    const rows = Math.ceil(h / vertDist) + 2;
    
    const time = rotation * settings.speed;
    const c0 = colors[0];
    const c1 = colors[1] || c0;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.lineWidth = 1 + high * 3;

    for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
            const xOffset = (r % 2) * (hexW / 2);
            const cx = c * hexW + xOffset;
            const cy = r * vertDist;
            
            // Distance from center
            const dx = cx - w/2;
            const dy = cy - h/2;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const maxDist = Math.max(w,h) / 2;
            const normDist = 1 - Math.min(dist / maxDist, 1);
            
            // Pulse wave
            const wave = Math.sin(dist * 0.01 - time * 2);
            const active = wave > 0.5;
            
            // Beat flash center
            let intensity = 0.1;
            if (active) intensity += mids * 0.5;
            if (beat && normDist > 0.7) intensity += 0.8;
            
            if (intensity < 0.15) continue;

            ctx.strokeStyle = active ? c1 : c0;
            ctx.globalAlpha = Math.min(1, intensity);
            
            // Draw Hex
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI / 3 * i + (Math.PI/6);
                const px = cx + size * Math.cos(angle);
                const py = cy + size * Math.sin(angle);
                if (i===0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
            
            if (intensity > 0.6) {
                ctx.fillStyle = c1;
                ctx.globalAlpha = (intensity - 0.6) * 0.5;
                ctx.fill();
            }
        }
    }
    ctx.restore();
  }
}
