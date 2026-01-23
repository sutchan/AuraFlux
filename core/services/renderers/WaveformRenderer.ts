/**
 * File: core/services/renderers/WaveformRenderer.ts
 * Version: 3.1.0
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-26 20:20
 * Description: Re-enabled horizontal movement with a parallax effect for enhanced visual depth.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage, applySoftCompression } from '../audioUtils';

export class WaveformRenderer implements IVisualizerRenderer {
  private smoothedEnergies: number[] = new Array(6).fill(0);
  private maxEnergyObserved = 0.15; 
  private phaseOffset = 0; 

  init() {
    this.smoothedEnergies = new Array(6).fill(0);
    this.maxEnergyObserved = 0.15;
    this.phaseOffset = 0;
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const centerY = h / 2;
    const layerCount = 6;
    
    // --- 1. Enhanced Gain Control ---
    const globalEnergy = getAverage(data, 0, data.length) / 255;
    
    // Adaptive Peak Tracking: Slow decay to keep headroom
    this.maxEnergyObserved = Math.max(0.15, this.maxEnergyObserved * 0.995, globalEnergy);
    const autoGainScale = 0.25 / this.maxEnergyObserved;

    const beatImpact = beat ? 0.3 : 0;
    this.phaseOffset += (settings.speed * 0.04) + beatImpact; // Horizontal phase shift for parallax scrolling

    const configs = [
        { start: 0, end: 6, amp: 0.7, freq: 0.003, width: 3.5, gain: 1.0, z: 1.0 },    
        { start: 7, end: 20, amp: 0.7, freq: 0.008, width: 3.5, gain: 1.5, z: 1.0 }, 
        { start: 25, end: 60, amp: 0.7, freq: 0.015, width: 3.5, gain: 2.0, z: 1.0 }, 
        { start: 65, end: 110, amp: 0.7, freq: 0.03, width: 3.5, gain: 3.0, z: 1.0 }, 
        { start: 120, end: 180, amp: 0.7, freq: 0.06, width: 3.5, gain: 4.5, z: 1.0 }, 
        { start: 190, end: 255, amp: 0.7, freq: 0.12, width: 3.5, gain: 7.0, z: 1.0 }  
    ];

    for (let i = 0; i < layerCount; i++) {
        if (settings.quality === 'low' && i > 3) continue;

        const config = configs[i];
        const color = colors[i % colors.length];
        
        const localEnergyRaw = getAverage(data, config.start, config.end) / 255;
        
        // --- Soft Clipping & Limiting Logic ---
        // Apply compression to the local signal to keep it from hitting the top.
        const compressedLocal = applySoftCompression(localEnergyRaw, 0.75);
        
        const coupling = i > 3 ? 0.4 : 0; 
        let combined = (compressedLocal * (1 - coupling) + globalEnergy * coupling) * config.gain * autoGainScale;
        
        if (combined < 0.02) combined = 0;

        const targetEnergy = combined * settings.sensitivity;
        const lerpFactor = targetEnergy > this.smoothedEnergies[i] ? 0.25 : 0.06;
        this.smoothedEnergies[i] += (targetEnergy - this.smoothedEnergies[i]) * lerpFactor;
        
        const energy = this.smoothedEnergies[i];
        
        const depthX = Math.sin(rotation * 0.5 + i) * 20;
        const yOffset = (i - (layerCount - 1) / 2) * (h * 0.05); 

        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = config.width * (0.8 + energy * 0.3);
        ctx.globalAlpha = (0.25 + energy * 0.6) * (settings.glow ? 1.0 : 0.6);

        const points = settings.quality === 'high' ? 90 : (settings.quality === 'med' ? 45 : 30);
        const step = w / points;

        // Parallax multiplier: Layers with higher 'i' (closer) move faster.
        const parallaxMultiplier = 0.5 + (i / (layerCount - 1)); // Ranges from 0.5x to 1.5x

        const getY = (x: number) => {
            const envelope = Math.sin((x / w) * Math.PI);
            const jitter = (i > 4 && energy > 0.01) ? (Math.random() - 0.5) * 5 * energy : 0;
            
            // Limit max amplitude to avoid screen exit
            const maxAmplitude = h * 0.35;
            const rawAmp = (h * 0.12 * config.amp) * energy * envelope;
            const amplitude = Math.min(rawAmp, maxAmplitude);
            
            const wave1 = Math.sin(x * config.freq + this.phaseOffset * parallaxMultiplier + i);
            const wave2 = Math.sin(x * config.freq * 2.5 - this.phaseOffset * 0.4 * parallaxMultiplier);
            
            return centerY + yOffset + ((wave1 + wave2) * amplitude) + jitter;
        };

        let currentX = depthX;
        let currentY = getY(0);
        ctx.moveTo(currentX, currentY);

        for (let j = 0; j < points; j++) {
            const nextX = depthX + (j + 1) * step;
            const nextY = getY(nextX);
            const xc = (currentX + nextX) / 2;
            const yc = (currentY + nextY) / 2;
            ctx.quadraticCurveTo(currentX, currentY, xc, yc);
            currentX = nextX;
            currentY = nextY;
        }
        
        ctx.stroke();
    }

    ctx.restore();
  }
}