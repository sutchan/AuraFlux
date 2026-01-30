
/**
 * File: core/services/renderers/GeometryRenderers.ts
 * Version: 2.2.0
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-16 10:00
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

interface RingData {
    z: number;
    scale: number;
    alpha: number;
    lineWidth: number;
    color: string;
    points: { x: number, y: number }[];
}

export class TunnelRenderer implements IVisualizerRenderer {
  private sinCache: Float32Array = new Float32Array(0);
  private cosCache: Float32Array = new Float32Array(0);

  init() {
    this.sinCache = new Float32Array(0);
    this.cosCache = new Float32Array(0);
  }

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
    
    const cx = w / 2;
    const cy = h / 2;
    const minDim = Math.min(w, h);
    
    // Balanced count: Enough sides to look round, but low enough to keep the "Cyber" structure visible.
    const rings = settings.quality === 'high' ? 24 : (settings.quality === 'med' ? 18 : 12);
    const sides = settings.quality === 'high' ? 32 : (settings.quality === 'med' ? 24 : 16);
    
    this.updateCache(sides);

    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    
    const fov = Math.max(w, h) * 0.9; 
    const zSpacing = 160; 
    const maxDepth = rings * zSpacing;
    const virtualTime = rotation * 1000; 
    
    ctx.save();
    
    // Global styles for watertight joints
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#000000';
    
    // FIX: Use 'source-over' instead of 'lighter' to prevent bright additive spots at joints.
    // This creates solid, consistent neon lines instead of "hot" vertices.
    ctx.globalCompositeOperation = 'source-over';
    
    // Camera Shake
    let shakeX = 0, shakeY = 0;
    if (beat) {
        const force = 15 * settings.sensitivity;
        shakeX = (Math.random() - 0.5) * force;
        shakeY = (Math.random() - 0.5) * force;
    }
    ctx.translate(cx + shakeX, cy + shakeY);
    ctx.rotate(rotation * 0.1); 

    // --- 1. Center Singularity ---
    const coreSize = (minDim * 0.05 + bass * (minDim * 0.2));
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
    grad.addColorStop(0, colors[2] || colors[0]);
    grad.addColorStop(0.4, `${colors[1]}60`);
    grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
    ctx.fill();

    // --- 2. Pre-calculate & Sort (The "Watertight" Fix) ---
    const ringList: RingData[] = [];

    // Responsive sizing logic:
    // Base radius is 35% of the shortest screen dimension (filling ~70% diameter at rest)
    // Audio amplitude can expand this by another 25% (filling ~120% diameter at max volume)
    const baseR = minDim * 0.35;
    const audioAmp = minDim * 0.25 * settings.sensitivity;

    for (let i = 0; i < rings; i++) {
        // Calculate looping Z
        let z = (i * zSpacing - virtualTime) % maxDepth;
        if (z < 0) z += maxDepth;
        
        // Skip if behind camera
        if (z < 10) continue; 

        const scale = fov / (fov + z);
        
        // Depth Fade (Far)
        const depthAlpha = Math.pow(1.0 - (z / maxDepth), 1.5);
        // Camera Fade (Near) - prevents popping when ring passes camera
        const frontAlpha = Math.min(1.0, (z - 10) / 200);
        
        const finalAlpha = depthAlpha * frontAlpha * (0.6 + bass * 0.4);
        if (finalAlpha < 0.01) continue;

        // Shape Math
        const twistAngle = z * 0.0015 - rotation * 0.5;
        const cosTwist = Math.cos(twistAngle);
        const sinTwist = Math.sin(twistAngle);
        
        // Thickness: 5x boost at front
        const proximityBoost = Math.pow(scale, 2.5);
        const lineWidth = Math.max(1.0, 12.0 * proximityBoost * (1 + bass * 0.5));
        
        // Generate Vertices
        const points: {x: number, y: number}[] = [];
        for (let j = 0; j < sides; j++) {
            const binIndex = Math.floor(((j % sides) / sides) * 40);
            const r = (baseR + (data[binIndex] / 255) * audioAmp) * scale;
            
            const ux = this.cosCache[j];
            const uy = this.sinCache[j];
            
            // Apply twist rotation manually to vertex
            const rx = ux * cosTwist - uy * sinTwist;
            const ry = ux * sinTwist + uy * cosTwist;
            
            points.push({ x: rx * r, y: ry * r });
        }

        ringList.push({
            z,
            scale,
            alpha: finalAlpha,
            lineWidth,
            color: colors[i % colors.length],
            points
        });
    }

    // Sort: Furthest Z first (Painter's Algorithm)
    // Critical for 'source-over' rendering to look 3D
    ringList.sort((a, b) => b.z - a.z);

    // --- 3. Render Loop ---
    for (let i = 0; i < ringList.length; i++) {
        const curr = ringList[i];
        // Look ahead for the next CLOSER ring
        const next = ringList[i + 1]; 

        // --- Step A: Longitudinal Connectors ---
        // Only connect if the next ring is physically close (part of the same tunnel segment).
        // This check prevents drawing lines across the screen when the tunnel wraps around.
        if (next && (curr.z - next.z) < zSpacing * 1.5) {
            ctx.beginPath();
            // Interpolate width for smooth joints
            ctx.lineWidth = (curr.lineWidth + next.lineWidth) / 2;
            ctx.strokeStyle = curr.color;
            ctx.globalAlpha = Math.min(curr.alpha, next.alpha) * 0.8;

            for (let j = 0; j < sides; j++) {
                const p1 = curr.points[j];
                const p2 = next.points[j];
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
            }
            
            // Subtle glow for connectors
            if (settings.glow) {
                // Boosted blur to maintain neon look without 'lighter' mode
                ctx.shadowBlur = ctx.lineWidth * 4;
                ctx.shadowColor = curr.color;
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset
        }

        // --- Step B: Transverse Ring ---
        ctx.beginPath();
        
        // Use LINEAR segments (lineTo) instead of curves.
        // With high side count + lineJoin='round', it looks smooth but is watertight.
        const p0 = curr.points[0];
        ctx.moveTo(p0.x, p0.y);
        for (let j = 1; j < curr.points.length; j++) {
            const p = curr.points[j];
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath(); // Ensure start/end join perfectly

        ctx.lineWidth = curr.lineWidth;
        ctx.strokeStyle = curr.color;
        ctx.globalAlpha = curr.alpha;
        
        if (settings.glow) {
            // Boosted blur for rings
            ctx.shadowBlur = curr.lineWidth * 5;
            ctx.shadowColor = curr.color;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
