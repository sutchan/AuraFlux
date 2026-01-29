
/**
 * File: core/services/renderers/WaveformRenderer.ts
 * Version: 2.0.0
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-12 12:00
 * Changes: Stereo Support. Top half = Left, Bottom half = Right.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage, applySoftCompression } from '../audioUtils';

export class WaveformRenderer implements IVisualizerRenderer {
  private smoothedEnergiesL: number[] = new Array(6).fill(0);
  private smoothedEnergiesR: number[] = new Array(6).fill(0);
  private maxEnergyObserved = 0.15; 
  private phaseOffset = 0; 

  init() {
    this.smoothedEnergiesL = new Array(6).fill(0);
    this.smoothedEnergiesR = new Array(6).fill(0);
    this.maxEnergyObserved = 0.15;
    this.phaseOffset = 0;
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean, dataR?: Uint8Array) {
    if (colors.length === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const layerCount = 6;
    const isStereo = !!dataR;
    const centerY = h / 2;
    
    // --- 1. Enhanced Gain Control (Shared) ---
    const globalEnergyL = getAverage(data, 0, data.length) / 255;
    const globalEnergyR = isStereo ? getAverage(dataR!, 0, dataR!.length) / 255 : globalEnergyL;
    
    // Adaptive Peak Tracking
    this.maxEnergyObserved = Math.max(0.15, this.maxEnergyObserved * 0.995, Math.max(globalEnergyL, globalEnergyR));
    const autoGainScale = 0.25 / this.maxEnergyObserved;

    const beatImpact = beat ? 0.3 : 0;
    this.phaseOffset += (settings.speed * 0.04) + beatImpact;

    const configs = [
        { start: 0, end: 6, amp: 0.7, freq: 0.003, width: 10.5, gain: 1.0 }, 
        { start: 7, end: 20, amp: 0.7, freq: 0.008, width: 7.0, gain: 1.5 },
        { start: 25, end: 60, amp: 0.7, freq: 0.015, width: 3.5, gain: 2.0 }, 
        { start: 65, end: 110, amp: 0.7, freq: 0.03, width: 3.5, gain: 3.0 }, 
        { start: 120, end: 180, amp: 0.7, freq: 0.06, width: 3.5, gain: 4.5 }, 
        { start: 190, end: 255, amp: 0.7, freq: 0.12, width: 3.5, gain: 7.0 }  
    ];

    const drawWaves = (channelData: Uint8Array, smoothedEnergies: number[], globalEnergy: number, direction: 1 | -1) => {
        for (let i = 0; i < layerCount; i++) {
            if (settings.quality === 'low' && i > 3) continue;

            const config = configs[i];
            const color = colors[i % colors.length];
            
            const localEnergyRaw = getAverage(channelData, config.start, config.end) / 255;
            const compressedLocal = applySoftCompression(localEnergyRaw, 0.75);
            const coupling = i > 3 ? 0.4 : 0; 
            let combined = (compressedLocal * (1 - coupling) + globalEnergy * coupling) * config.gain * autoGainScale;
            if (combined < 0.02) combined = 0;

            const targetEnergy = combined * settings.sensitivity;
            const lerpFactor = targetEnergy > smoothedEnergies[i] ? 0.25 : 0.06;
            smoothedEnergies[i] += (targetEnergy - smoothedEnergies[i]) * lerpFactor;
            
            const energy = smoothedEnergies[i];
            
            // Stereo Offset: Left channel slightly up, Right channel slightly down
            // Or stick to center and mirror
            const channelYOffset = isStereo ? (direction * h * 0.05) : 0; 
            
            // Parallax Depth
            const depthX = Math.sin(rotation * 0.5 + i) * 20;
            // Layer spread
            const yLayerSpread = (i - (layerCount - 1) / 2) * (h * 0.05); 

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
            const parallaxMultiplier = 0.5 + (i / (layerCount - 1));

            const getY = (x: number) => {
                const envelope = Math.sin((x / w) * Math.PI);
                const jitter = (i > 4 && energy > 0.01) ? (Math.random() - 0.5) * 5 * energy : 0;
                
                const maxAmplitude = h * 0.35;
                const rawAmp = (h * 0.12 * config.amp) * energy * envelope;
                const amplitude = Math.min(rawAmp, maxAmplitude);
                
                // Direction flips the wave vertically if needed, but here we simply draw in place
                // Stereo Effect: Invert phase for Right channel to create symmetry
                const stereoPhase = isStereo && direction === -1 ? Math.PI : 0;
                
                const wave1 = Math.sin(x * config.freq + this.phaseOffset * parallaxMultiplier + i + stereoPhase);
                const wave2 = Math.sin(x * config.freq * 2.5 - this.phaseOffset * 0.4 * parallaxMultiplier);
                
                // If stereo, bias drawing towards top or bottom
                // Or simply center it. Let's keep centered but use direction to flip amplitude?
                // Visual Design: Top/Bottom mirroring looks best.
                
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

    // Draw Left (Upwards / Top)
    // If Mono: Draw once (direction 1), standard logic handles display.
    // If Stereo: Draw Left as Up (1), Right as Down (-1).
    
    if (isStereo) {
        // Left Channel (Up)
        drawWaves(data, this.smoothedEnergiesL, globalEnergyL, -1); // Up (negative Y relative to center)
        // Right Channel (Down)
        drawWaves(dataR!, this.smoothedEnergiesR, globalEnergyR, 1); // Down
    } else {
        // Mono (Standard)
        drawWaves(data, this.smoothedEnergiesL, globalEnergyL, 1);
    }

    ctx.restore();
  }
}
