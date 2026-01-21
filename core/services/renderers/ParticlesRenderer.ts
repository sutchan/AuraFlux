
/**
 * File: core/services/renderers/ParticlesRenderer.ts
 * Version: 1.1.2
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class ParticlesRenderer implements IVisualizerRenderer {
  private particles: Array<{ 
    angle: number; 
    radius: number; 
    z: number; 
    speedOffset: number; 
    prevX: number; 
    prevY: number; 
    colorIdx: number; 
    size: number;
  }> = [];

  init() { this.particles = []; }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    
    // 1. Audio Analysis: Split spectrum into Bass, Mids, and Treble
    const bassRaw = getAverage(data, 0, 10) / 255;
    const midsRaw = getAverage(data, 20, 60) / 255;
    const trebleRaw = getAverage(data, 100, 180) / 255;

    // Apply sensitivity curve - use power function to emphasize peaks
    const bass = Math.pow(bassRaw * settings.sensitivity, 1.2); 
    const mids = midsRaw * settings.sensitivity;
    const treble = Math.pow(trebleRaw * settings.sensitivity, 1.5); // Higher exponent for cleaner sparkles
    
    const driftX = Math.sin(rotation * 0.5) * (w * 0.15);
    const driftY = Math.cos(rotation * 0.3) * (h * 0.15);
    const centerX = w / 2 + driftX;
    const centerY = h / 2 + driftY;

    const maxParticles = settings.quality === 'high' ? 250 : settings.quality === 'med' ? 150 : 80;

    // Optimization: Object Pooling
    // Ensure array size matches maxParticles without creating unnecessary garbage
    if (this.particles.length < maxParticles) {
        while (this.particles.length < maxParticles) {
            const p = {} as any;
            this.resetParticle(p, w, h, Math.random() * 1000, colors.length);
            this.particles.push(p);
        }
    } else if (this.particles.length > maxParticles) {
        this.particles.length = maxParticles;
    }

    // Base speed calculation
    const baseSpeed = (settings.speed * 0.5) * 8; 
    const beatSurge = beat ? 2.0 : 1.0;
    
    // Flow speed: Driven by Bass (pulse) and Mids (consistency)
    const speed = baseSpeed * (1 + bass * 3 + mids * 1.5) * beatSurge; 
    const rotSpeed = 0.001 * (settings.speed * 0.5) * (1 + bass * 1.0);

    ctx.lineCap = 'round';

    for (const p of this.particles) {
        // Individual particles speed jitter based on treble
        const individualSpeed = speed * p.speedOffset * (1 + treble * 0.2);
        p.z -= individualSpeed;
        p.angle += rotSpeed * p.speedOffset;

        // Reset if passed camera (z <= 10)
        // Reuse the object 'p' instead of creating a new one
        if (p.z <= 10) {
            this.resetParticle(p, w, h, 1000 + Math.random() * 200, colors.length);
            continue;
        }

        const fov = 300;
        const scale = fov / p.z;
        const x = centerX + Math.cos(p.angle) * p.radius * scale;
        const y = centerY + Math.sin(p.angle) * p.radius * scale;

        // Draw only if valid previous coordinates exist and didn't just reset
        if (p.prevX !== -9999) {
            const dx = x - p.prevX;
            const dy = y - p.prevY;
            const distSq = dx*dx + dy*dy;

            // Render if moved slightly but not teleported (check distSq < w*w/4 approx)
            if (distSq > 0.25 && distSq < (w * 0.5) ** 2) {
                const color = colors[p.colorIdx % colors.length];
                
                // Visual Scaling: 
                // Bass expands thickness significantly
                // Treble adds fine detail sharpness
                const audioScale = 1 + bass * 2.0 + treble * 0.5;
                const size = Math.max(0.5, p.size * scale * audioScale);
                
                // Alpha Logic:
                // 1. Distance fade (closer = brighter, but not too blinding close up)
                const distAlpha = Math.min(1, scale * 1.2);
                
                // 2. Treble Shimmer (high frequencies cause random flashing)
                // Using random threshold creates a "sparkle" texture
                const trebleFlash = treble * 0.8 * (Math.random() > 0.4 ? 1 : 0);
                
                // 3. Mids Glow (adds sustained brightness)
                const midGlow = mids * 0.3;

                const alpha = Math.min(1, (distAlpha * 0.7) + trebleFlash + midGlow);

                if (alpha > 0.05) {
                    ctx.lineWidth = size;
                    ctx.strokeStyle = color;
                    ctx.globalAlpha = alpha;
                    
                    ctx.beginPath();
                    ctx.moveTo(p.prevX, p.prevY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            }
        }

        p.prevX = x;
        p.prevY = y;
    }
    ctx.globalAlpha = 1.0;
  }

  // Object pooling helper: Resets an existing particle object in place
  private resetParticle(p: any, w: number, h: number, z: number, colorCount: number) {
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.max(w, h);
      // Spawn radius: keep them somewhat centered but spread out
      const radius = Math.random() * spread * 1.5 + spread * 0.1; 

      p.angle = angle;
      p.radius = radius; 
      p.z = z; 
      p.speedOffset = 0.5 + Math.random(); // Variation in speed
      p.prevX = -9999; // Sentinel value for "just reset"
      p.prevY = -9999;
      p.size = 0.5 + Math.random() * 1.5;
      p.colorIdx = Math.floor(Math.random() * colorCount);
  }
}
