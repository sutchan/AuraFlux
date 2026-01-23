/**
 * File: core/services/renderers/GeometryRenderers.ts
 * Version: 2.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-02-25 20:30
 * Description: Upgraded Geometric Tunnel with 3D projection, Spiral Mesh, and Polar FFT mapping.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class TunnelRenderer implements IVisualizerRenderer {
  init() {}

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    
    // --- 1. Config & Setup ---
    const cx = w / 2;
    const cy = h / 2;
    
    // Quality scaling: Adjust geometry density based on settings
    const rings = settings.quality === 'high' ? 40 : (settings.quality === 'med' ? 28 : 16);
    const sides = settings.quality === 'high' ? 24 : (settings.quality === 'med' ? 16 : 12);
    
    // Audio Features Extraction
    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    const treble = getAverage(data, 100, 200) / 255 * settings.sensitivity;
    
    // Tunnel Physics
    // Z-Depth goes from Near (0) to Far (maxDepth).
    const fov = Math.max(w, h) * 0.8; 
    const zSpacing = 150;
    const maxDepth = rings * zSpacing;
    
    // Movement: rotation acts as the time accumulator
    // Scale up rotation to drive Z-axis movement speed
    const virtualTime = rotation * 1000; 
    
    ctx.save();
    
    // Clear with specific composite for glow effect
    ctx.fillStyle = '#000000';
    // 'lighter' creates additive blending, essential for the neon energy look
    ctx.globalCompositeOperation = 'lighter';
    
    // Camera Shake on Beat
    let shakeX = 0, shakeY = 0;
    if (beat) {
        shakeX = (Math.random() - 0.5) * 30 * settings.sensitivity;
        shakeY = (Math.random() - 0.5) * 30 * settings.sensitivity;
    }
    ctx.translate(cx + shakeX, cy + shakeY);
    
    // Global Spin: Rotate the entire camera view slowly
    ctx.rotate(rotation * 0.2); 

    // --- 2. Center Burst (The "Singularity") ---
    // A glowing core at the vanishing point
    const coreColor = colors[2] || colors[0];
    const coreSize = (30 + bass * 120);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
    grad.addColorStop(0, coreColor);
    grad.addColorStop(0.4, `${colors[1]}80`); // Semi-transparent mid
    grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
    ctx.fill();

    // --- 3. Grid Projection & Mesh Generation ---
    
    // Store current ring's projected points to connect with the previous ring (Longitudinal lines)
    let prevRingPoints: {x: number, y: number}[] = [];
    
    for (let i = 0; i < rings; i++) {
        // Calculate Z depth with Infinite Scroll logic
        // Formula: (StaticPos - Movement) % LoopSize
        let z = (i * zSpacing - virtualTime) % maxDepth;
        if (z < 0) z += maxDepth; // Handle negative wrap
        
        // Prevent z near 0 (division by zero) or behind camera
        if (z < 10) z += maxDepth; 

        // Perspective Scale Formula
        const scale = fov / (fov + z);
        
        // Depth Fog: Alpha fades as Z increases
        const depthAlpha = Math.pow(1.0 - (z / maxDepth), 2.5);
        
        // Optimization: Skip invisible distant rings
        if (depthAlpha < 0.01) continue; 

        // Spiral Twist: Rotate the ring based on its depth
        const twistAngle = z * 0.003 - rotation * 0.5;

        const currentRingPoints: {x: number, y: number}[] = [];
        
        ctx.beginPath();
        
        // Vertex Loop (The Polygon)
        for (let j = 0; j <= sides; j++) { 
            const jMod = j % sides; // Wrap index for closed loop
            
            // --- Polar FFT Mapping ---
            // Map the angle (j) to a specific frequency bin.
            // Spreads vertex index 0..sides across the 0..40 frequency bin range (Bass to Low-Mids)
            const binIndex = Math.floor((jMod / sides) * 40);
            const audioVal = data[binIndex] / 255;
            
            // Radius Modulation
            const baseR = 400; 
            // Audio expands the radius at that specific vertex angle
            const r = baseR + (audioVal * 300 * settings.sensitivity);
            
            const theta = (j / sides) * Math.PI * 2 + twistAngle;
            
            // Project 3D -> 2D
            const x = Math.cos(theta) * r * scale;
            const y = Math.sin(theta) * r * scale;
            
            currentRingPoints.push({x, y});
            
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        // Draw Lateral Ring
        ctx.closePath();
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 2 * scale * (1 + bass); // Line gets thicker closer to camera
        ctx.globalAlpha = depthAlpha * (0.4 + bass * 0.3); // Pulse opacity with bass
        ctx.stroke();
        
        // --- 4. Longitudinal Connections (The Wireframe) ---
        // Connect current ring to previous ring to form the tube mesh.
        // We must ensure we don't connect across the "wrap-around" seam.
        if (i > 0 && prevRingPoints.length > 0) {
             // Heuristic: Check if the ring index is logically sequential in the loop
             const rawZ = (i * zSpacing - virtualTime);
             const rawPrevZ = ((i-1) * zSpacing - virtualTime);
             const cycleCurrent = Math.floor(rawZ / maxDepth);
             const cyclePrev = Math.floor(rawPrevZ / maxDepth);
             
             // Only draw connection if they are in the same modulo cycle
             if (cycleCurrent === cyclePrev) {
                 ctx.beginPath();
                 ctx.strokeStyle = colors[(i+1) % colors.length];
                 ctx.globalAlpha = depthAlpha * 0.2; // Dimmer longitudinal lines
                 ctx.lineWidth = 1 * scale;
                 
                 for (let j = 0; j < sides; j++) {
                     const p1 = currentRingPoints[j];
                     const p2 = prevRingPoints[j];
                     ctx.moveTo(p1.x, p1.y);
                     ctx.lineTo(p2.x, p2.y);
                 }
                 ctx.stroke();
             }
        }
        
        // --- 5. Vertex Highlights (Cyber Nodes) ---
        // Draw bright dots at vertices for extra detail
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = depthAlpha * (0.5 + treble); // Sparkle with treble
        
        // Optimization: Draw dots on every other vertex
        for (let j = 0; j < sides; j+=2) { 
             const p = currentRingPoints[j];
             // Scale dot size by audio frequency at that vertex
             const binIndex = Math.floor((j / sides) * 40);
             const dotSize = 4 * scale * (1 + (data[binIndex] / 255) * 2);
             
             ctx.beginPath();
             ctx.arc(p.x, p.y, dotSize, 0, Math.PI*2);
             ctx.fill();
        }

        prevRingPoints = currentRingPoints;
    }

    ctx.restore();
  }
}