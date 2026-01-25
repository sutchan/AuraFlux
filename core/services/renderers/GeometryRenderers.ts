/**
 * File: core/services/renderers/GeometryRenderers.ts
 * Version: 1.7.32
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
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
    
    // Performance Optimization: Scaled down ring/side counts
    // High: 24/16, Med: 16/10, Low: 10/6
    const rings = settings.quality === 'high' ? 24 : (settings.quality === 'med' ? 16 : 10);
    const sides = settings.quality === 'high' ? 16 : (settings.quality === 'med' ? 10 : 6);
    
    this.updateCache(sides);

    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    const treble = getAverage(data, 100, 200) / 255 * settings.sensitivity;
    
    const fov = Math.max(w, h) * 0.75; 
    const zSpacing = 160;
    const maxDepth = rings * zSpacing;
    const virtualTime = rotation * 800; // Slightly slower movement for better motion clarity
    
    ctx.save();
    
    // Optimization: Draw background once
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

    // --- 2. Singularity Burst (Cached-like behavior) ---
    const coreSize = (40 + bass * 140);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
    grad.addColorStop(0, colors[2] || colors[0]);
    grad.addColorStop(0.5, `${colors[1]}40`);
    grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
    ctx.fill();

    // --- 3. Grid Projection ---
    // Buffer to store projected vertices for connection drawing
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

        const baseR = 500; // Increased from 380 for a fuller tunnel
        const audioAmp = 280 * settings.sensitivity;

        ctx.beginPath();
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = Math.max(0.5, 1.5 * scale * (1 + bass));
        ctx.globalAlpha = depthAlpha * (0.35 + bass * 0.4);

        for (let j = 0; j <= sides; j++) {
            const binIndex = Math.floor(((j % sides) / sides) * 40);
            const r = (baseR + (data[binIndex] / 255) * audioAmp) * scale;
            
            // Apply rotation matrix for twist to pre-cached unit circle
            const ux = this.cosCache[j];
            const uy = this.sinCache[j];
            const x = (ux * cosTwist - uy * sinTwist) * r;
            const y = (ux * sinTwist + uy * cosTwist) * r;
            
            if (j < sides) {
                allProjectedPoints.push({ x, y, alpha: depthAlpha, scale });
            }
            
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // --- 4. Longitudinal Path Batching ---
    // Instead of drawing every ring-to-ring line individually, 
    // we batch lines per side index to reduce canvas state changes.
    const activeRingCount = allProjectedPoints.length / sides;
    if (activeRingCount > 1) {
        ctx.globalAlpha = 0.12; 
        ctx.lineWidth = 0.8;
        
        // Quality optimization: Only draw every 2nd connection on lower settings
        const sideStep = settings.quality === 'low' ? 2 : 1;
        
        for (let s = 0; s < sides; s += sideStep) {
            ctx.beginPath();
            ctx.strokeStyle = colors[s % colors.length];
            for (let r = 0; r < activeRingCount - 1; r++) {
                const p1 = allProjectedPoints[r * sides + s];
                const p2 = allProjectedPoints[(r + 1) * sides + s];
                
                // Distance check to avoid lines jumping across wrap-around
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                if (dx*dx + dy*dy < (w * 0.4) ** 2) {
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                }
            }
            ctx.stroke();
        }
    }

    // --- 5. Cyber Nodes (Batch Drawing) ---
    if (settings.quality !== 'low') {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < allProjectedPoints.length; i += 2) {
            const p = allProjectedPoints[i];
            const nodeAlpha = p.alpha * (0.4 + treble * 0.6);
            if (nodeAlpha < 0.1) continue;
            
            ctx.globalAlpha = nodeAlpha;
            const dotSize = Math.max(1, 3 * p.scale * (1 + treble));
            ctx.beginPath();
            ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
  }
}