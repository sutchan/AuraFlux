
/**
 * File: core/services/renderers/WaveformRenderer.ts
 * Version: 2.1.0
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-16 18:00
 * Changes: Reduced to 5 lines, sensitivity halved, frequency bands optimized.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage, applySoftCompression } from '../audioUtils';

export class WaveformRenderer implements IVisualizerRenderer {
  private smoothedEnergiesL: number[] = new Array(5).fill(0);
  private smoothedEnergiesR: number[] = new Array(5).fill(0);
  private maxEnergyObserved = 0.15; 
  private phaseOffset = 0; 

  init() {
    this.smoothedEnergiesL = new Array(5).fill(0);
    this.smoothedEnergiesR = new Array(5).fill(0);
    this.maxEnergyObserved = 0.15;
    this.phaseOffset = 0;
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean, dataR?: Uint8Array) {
    if (colors.length === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const layerCount = 5; // Reduced to 5 lines
    const isStereo = !!dataR;
    const centerY = h / 2;
    
    // Reduced sensitivity by 50% for more headroom and elegance
    const effectiveSensitivity = settings.sensitivity * 0.5;

    // --- 1. Enhanced Gain Control (Shared) ---
    const globalEnergyL = getAverage(data, 0, data.length) / 255;
    const globalEnergyR = isStereo ? getAverage(dataR!, 0, dataR!.length) / 255 : globalEnergyL;
    
    // Adaptive Peak Tracking
    this.maxEnergyObserved = Math.max(0.15, this.maxEnergyObserved * 0.995, Math.max(globalEnergyL, globalEnergyR));
    const autoGainScale = 0.25 / this.maxEnergyObserved;

    const beatImpact = beat ? 0.3 : 0;
    this.phaseOffset += (settings.speed * 0.04) + beatImpact;

    // Optimized Bands for 5 Ribbons (Sub, Bass, LowMid, Mid, High)
    const configs = [
        { start: 0, end: 10, amp: 0.8, freq: 0.003, width: 14.0, gain: 1.0 }, 
        { start: 12, end: 40, amp: 0.8, freq: 0.007, width: 10.0, gain: 1.2 },
        { start: 45, end: 100, amp: 0.7, freq: 0.015, width: 6.0, gain: 1.5 }, 
        { start: 110, end: 180, amp: 0.7, freq: 0.04, width: 4.5, gain: 2.0 }, 
        { start: 190, end: 255, amp: 0.6, freq: 0.09, width: 3.0, gain: 3.5 }  
    ];

    const drawWaves = (channelData: Uint8Array, smoothedEnergies: number[], globalEnergy: number, direction: 1 | -1) => {
        for (let i = 0; i < layerCount; i++) {
            if (settings.quality === 'low' && i > 3) continue;

            const config = configs[i];
            const color = colors[i % colors.length];
            
            const localEnergyRaw = getAverage(channelData, config.start, config.end) / 255;
            const compressedLocal = applySoftCompression(localEnergyRaw, 0.75);
            // Less coupling for cleaner separation
            const coupling = i > 3 ? 0.2 : 0; 
            let combined = (compressedLocal * (1 - coupling) + globalEnergy * coupling) * config.gain * autoGainScale;
            if (combined < 0.02) combined = 0;

            const targetEnergy = combined * effectiveSensitivity;
            const lerpFactor = targetEnergy > smoothedEnergies[i] ? 0.2 : 0.05; // Smoother attack/decay
            smoothedEnergies[i] += (targetEnergy - smoothedEnergies[i]) * lerpFactor;
            
            const energy = smoothedEnergies[i];
            
            // Stereo Offset: Left channel slightly up, Right channel slightly down
            const channelYOffset = isStereo ? (direction * h * 0.05) : 0; 
            
            // Parallax Depth
            const depthX = Math.sin(rotation * 0.5 + i) * 20;
            // Layer spread (Vertical spacing)
            const yLayerSpread = (i - (layerCount - 1) / 2) * (h * 0.06); 

            const grad = ctx.createLinearGradient(0, 0, w, 0);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.5, color);
            grad.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.strokeStyle = grad;
            ctx.lineWidth = config.width * (0.8 + energy * 0.3);
            
            // Lower base alpha for "Silk" look
            ctx.globalAlpha = (0.2 + energy * 0.5) * (settings.glow ? 0.9 : 0.6);

            const points = settings.quality === 'high' ? 90 : (settings.quality === 'med' ? 45 : 30);
            const step = w / points;
            const parallaxMultiplier = 0.5 + (i / (layerCount - 1));

            const getY = (x: number) => {
                const envelope = Math.sin((x / w) * Math.PI);
                const jitter = (i > 3 && energy > 0.01) ? (Math.random() - 0.5) * 3 * energy : 0;
                
                const maxAmplitude = h * 0.35;
                const rawAmp = (h * 0.15 * config.amp) * energy * envelope;
                const amplitude = Math.min(rawAmp, maxAmplitude);
                
                // Stereo Effect: Invert phase for Right channel to create symmetry
                const stereoPhase = isStereo && direction === -1 ? Math.PI : 0;
                
                const wave1 = Math.sin(x * config.freq + this.phaseOffset * parallaxMultiplier + i + stereoPhase);
                const wave2 = Math.sin(x * config.freq * 2.5 - this.phaseOffset * 0.4 * parallaxMultiplier);
                
                return centerY + channelYOffset + yLayerSpread + ((wave1 + wave2) * amplitude * direction) + jitter;
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
    };

    if (isStereo) {
        drawWaves(data, this.smoothedEnergiesL, globalEnergyL, -1); // Up
        drawWaves(dataR!, this.smoothedEnergiesR, globalEnergyR, 1); // Down
    } else {
        drawWaves(data, this.smoothedEnergiesL, globalEnergyL, 1);
    }

    ctx.restore();
  }
}
