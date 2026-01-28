/**
 * File: core/services/renderers/GeometryRenderers.ts
 * Version: 1.7.34
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-09 13:00
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class TunnelRenderer implements IVisualizerRenderer {
  private sinCache: Float32Array = new Float32Array(0);
  private cosCache: Float32Array = new Float32Array(0);

  init() {
    this.sinCache = new Float32Array(0);
    this.cosCache = new Float32Array(0);
  }

  /**
   * Pre-calculates unit circle coordinates to avoid Math.sin/cos calls in hot loops.
   */
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
    
    // --- 1. Config & Performance Scaling ---
    const cx = w / 2;
    const cy = h / 2;
    
    // Optimization: Reduced node counts for sharper, cleaner lines and better performance
    const rings = settings.quality === 'high' ? 24 : (settings.quality === 'med' ? 16 : 10);
    const sides = settings.quality === 'high' ? 12 : (settings.quality === 'med' ? 8 : 5);
    
    this.updateCache(sides);

    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    const treble = getAverage(data, 100, 200) / 255 * settings.sensitivity;
    
    const fov = Math.max(w, h) * 0.75; 
    const zSpacing = 160;
    const maxDepth = rings * zSpacing;
    const virtualTime = rotation * 800;
    
    ctx.save();
    
    ctx.fillStyle = '#000000';
    ctx.globalCompositeOperation = 'lighter';
    
    let shakeX = 0, shakeY = 0;
    if (beat) {
        const force = 20 * settings.sensitivity;
        shakeX = (Math.random() - 0.5) * force;
        shakeY = (Math.random() - 0.5) * force;
    }
    ctx.translate(cx + shakeX, cy + shakeY);
    ctx.rotate(rotation * 0.15); 

    // --- 2. Singularity Burst ---
    const coreSize = (40 + bass * 140);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
    grad.addColorStop(0, colors[2] || colors[0]);
    grad.addColorStop(0.5, `${colors[1]}40`);
    grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
    ctx.fill();

    // --- 3. Grid Projection (Calculation & Optimized Drawing) ---
    const allProjectedPoints: {x: number, y: number, alpha: number, scale: number}[] = [];
    
    for (let i = 0; i < rings; i++) {
        let z = (i * zSpacing - virtualTime) % maxDepth;
        if (z < 0) z += maxDepth; 
        if (z < 15) z += maxDepth; 

        const scale = fov / (fov + z);
        const depthAlpha = Math.pow(1.0 - (z / maxDepth), 2.2);
        if (depthAlpha < 0.02) continue; 

        const twistAngle = z * 0.0025 - rotation * 0.4;
        const cosTwist = Math.cos(twistAngle);
        const sinTwist = Math.sin(twistAngle);

        const baseR = 500;
        const audioAmp = 280 * settings.sensitivity;
        
        // Depth-based thickening: Lines closer to camera (higher scale) are thicker.
        // Power curve 1.5 emphasizes the very close lines.
        const proximityBoost = Math.pow(scale, 1.5);
        const baseWidth = Math.max(0.5, 1.5 * proximityBoost * (1 + bass));
        
        const baseAlpha = depthAlpha * (0.35 + bass * 0.4);
        const color = colors[i % colors.length];

        // Create Path2D for each ring to enable multi-pass drawing for glow
        const ringPath = new Path2D();
        for (let j = 0; j <= sides; j++) {
            const binIndex = Math.floor(((j % sides) / sides) * 40);
            const r = (baseR + (data[binIndex] / 255) * audioAmp) * scale;
            
            const ux = this.cosCache[j];
            const uy = this.sinCache[j];
            const x = (ux * cosTwist - uy * sinTwist) * r;
            const y = (ux * sinTwist + uy * cosTwist) * r;
            
            if (j < sides) {
                allProjectedPoints.push({ x, y, alpha: depthAlpha, scale });
            }
            
            if (j === 0) ringPath.moveTo(x, y);
            else ringPath.lineTo(x, y);
        }
        
        // Optimized Glow Drawing
        if (settings.glow) {
            ctx.strokeStyle = color;
            ctx.lineWidth = baseWidth * 7;
            ctx.globalAlpha = baseAlpha * 0.1;
            ctx.stroke(ringPath);
            ctx.lineWidth = baseWidth * 3.5;
            ctx.globalAlpha = baseAlpha * 0.2;
            ctx.stroke(ringPath);
        }

        // Core line
        ctx.lineWidth = baseWidth;
        ctx.strokeStyle = color;
        ctx.globalAlpha = baseAlpha;
        ctx.stroke(ringPath);
    }

    // --- 4. Longitudinal Path Batching (Optimized) ---
    const activeRingCount = allProjectedPoints.length / sides;
    if (activeRingCount > 1) {
        const pathsByColor: Record<string, Path2D> = {};
        const sideStep = settings.quality === 'low' ? 2 : 1;

        for (let s = 0; s < sides; s += sideStep) {
            const color = colors[s % colors.length];
            if (!pathsByColor[color]) {
                pathsByColor[color] = new Path2D();
            }
            const path = pathsByColor[color];

            for (let r = 0; r < activeRingCount - 1; r++) {
                const p1 = allProjectedPoints[r * sides + s];
                const p2 = allProjectedPoints[(r + 1) * sides + s];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                if (dx*dx + dy*dy < (w * 0.4) ** 2) {
                    path.moveTo(p1.x, p1.y);
                    path.lineTo(p2.x, p2.y);
                }
            }
        }
        
        // Use a consistent base line width for longitudinals, but allow some scaling
        // We use a thinner line here to keep the "grid" look clean
        const longLineWidth = 0.8 * (1 + bass * 0.5); 
        const baseLineAlpha = 0.12;
        
        for (const color in pathsByColor) {
            const path = pathsByColor[color];
            ctx.strokeStyle = color;
            if (settings.glow) {
                ctx.lineWidth = longLineWidth * 5;
                ctx.globalAlpha = baseLineAlpha * 0.5;
                ctx.stroke(path);
            }
            ctx.lineWidth = longLineWidth;
            ctx.globalAlpha = baseLineAlpha;
            ctx.stroke(path);
        }
    }

    // --- 5. Cyber Nodes (Optimized Glow) ---
    if (settings.quality !== 'low' && treble > 0.2) {
        const baseAlpha = 0.4 + treble * 0.6;
        const step = settings.quality === 'high' ? 2 : 4;
        const corePath = new Path2D();
        const glowPath = settings.glow ? new Path2D() : null;

        for (let i = 0; i < allProjectedPoints.length; i += step) {
            const p = allProjectedPoints[i];
            if (p.alpha < 0.1) continue;
            
            const dotSize = Math.max(0.5, 2 * p.scale * (1 + treble));
            corePath.rect(p.x - dotSize / 2, p.y - dotSize / 2, dotSize, dotSize);
            if (glowPath) {
                const glowSize = dotSize * 4;
                glowPath.rect(p.x - glowSize / 2, p.y - glowSize / 2, glowSize, glowSize);
            }
        }
        
        ctx.fillStyle = '#ffffff';
        if (glowPath) {
            ctx.globalAlpha = baseAlpha * 0.15;
            ctx.fill(glowPath);
        }
        ctx.globalAlpha = baseAlpha;
        ctx.fill(corePath);
    }

    ctx.restore();
  }
}