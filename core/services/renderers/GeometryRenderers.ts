/**
 * File: core/services/renderers/GeometryRenderers.ts
 * Version: 1.0.8
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-18 20:00
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class TunnelRenderer implements IVisualizerRenderer {
  init() {}
  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    const centerX = w / 2;
    const centerY = h / 2;
    const shapes = 12;
    const maxRadius = Math.max(w, h) * 0.7;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // 设置笔触属性，防止转角处出现缺口或尖锐突起
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Zoom/Shake on beat
    if (beat) {
        const shakeX = (Math.random() - 0.5) * 20;
        const shakeY = (Math.random() - 0.5) * 20;
        ctx.translate(shakeX, shakeY);
    }

    for (let i = 0; i < shapes; i++) {
        // Use getAverage to sample a range of frequencies rather than a single bin
        // Spreading sampling across low-mids (bins 0-60 roughly)
        const startBin = Math.floor((i / shapes) * 60);
        const value = getAverage(data, startBin, startBin + 5) * settings.sensitivity;
        
        const depth = (i + (rotation * 5)) % shapes; 
        const scale = Math.pow(depth / shapes, 2); 
        const radius = maxRadius * scale * (1 + (value / 255)); 
        
        ctx.strokeStyle = colors[i % colors.length];
        
        // Thicker lines on beat
        const lineWidth = (1 + (scale * 20)) * settings.sensitivity * (beat ? 1.5 : 1.0);
        ctx.lineWidth = lineWidth;
        
        ctx.globalAlpha = scale; 
        ctx.beginPath();
        
        // 核心修复：改用 0 to 5 循环结合 closePath，确保图形完美闭合无缺口
        const sides = 6;
        const rotDir = (i % 2 === 0 ? 1 : -1);
        for (let j = 0; j < sides; j++) {
            const angle = (j / sides) * Math.PI * 2 + rotation * rotDir;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    ctx.restore();
  }
}