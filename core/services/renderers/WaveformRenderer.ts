/**
 * File: core/services/renderers/WaveformRenderer.ts
 * Version: 2.9.3
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-25 19:30
 * Description: Optimized resolution for better FPS.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class WaveformRenderer implements IVisualizerRenderer {
  private smoothedEnergies: number[] = new Array(6).fill(0);
  private maxEnergyObserved = 0.1; 
  private phaseOffset = 0; 

  init() {
    this.smoothedEnergies = new Array(6).fill(0);
    this.maxEnergyObserved = 0.1;
    this.phaseOffset = 0;
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const centerY = h / 2;
    const layerCount = 6;
    
    // --- 1. 自适应增益优化 ---
    const globalEnergy = getAverage(data, 0, data.length) / 255;
    this.maxEnergyObserved = Math.max(0.15, this.maxEnergyObserved * 0.995, globalEnergy);
    const autoGainScale = 0.25 / this.maxEnergyObserved;

    const beatImpact = beat ? 0.3 : 0;
    this.phaseOffset += (settings.speed * 0.04) + beatImpact;

    /**
     * 核心参数：
     * 1. 所有 z 值统一为 1.0，确保线条视觉一致性。
     * 2. 高频段增益补偿。
     */
    const configs = [
        { start: 0, end: 6, amp: 0.7, freq: 0.003, width: 3.5, gain: 1.0, z: 1.0 },    
        { start: 7, end: 20, amp: 0.7, freq: 0.008, width: 3.5, gain: 1.5, z: 1.0 }, 
        { start: 25, end: 60, amp: 0.7, freq: 0.015, width: 3.5, gain: 2.0, z: 1.0 }, 
        { start: 65, end: 110, amp: 0.7, freq: 0.03, width: 3.5, gain: 3.0, z: 1.0 }, 
        { start: 120, end: 180, amp: 0.7, freq: 0.06, width: 3.5, gain: 4.5, z: 1.0 }, 
        { start: 190, end: 255, amp: 0.7, freq: 0.12, width: 3.5, gain: 7.0, z: 1.0 }  
    ];

    for (let i = 0; i < layerCount; i++) {
        // Optimization: Skip higher layers on low quality setting to save cycles
        if (settings.quality === 'low' && i > 3) continue;

        const config = configs[i];
        const color = colors[i % colors.length];
        
        const localEnergy = getAverage(data, config.start, config.end) / 255;
        const coupling = i > 3 ? 0.4 : 0; 
        let combined = (localEnergy * (1 - coupling) + globalEnergy * coupling) * config.gain * autoGainScale;
        
        // 静音死区
        if (combined < 0.02) combined = 0;

        const targetEnergy = Math.pow(combined * settings.sensitivity, 1.2);
        const lerpFactor = targetEnergy > this.smoothedEnergies[i] ? 0.2 : 0.04;
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
        ctx.lineWidth = config.width * (0.8 + energy * 0.5);
        ctx.globalAlpha = (0.25 + energy * 0.75) * (settings.glow ? 1.0 : 0.6);

        // Optimization: Reduced path resolution
        // High: 90 segments, Med: 45, Low: 30
        // Previously 120/60
        const points = settings.quality === 'high' ? 90 : (settings.quality === 'med' ? 45 : 30);
        const step = w / points;

        const getY = (x: number) => {
            const envelope = Math.sin((x / w) * Math.PI);
            // Simpler jitter calc
            const jitter = (i > 4 && energy > 0.01) ? (Math.random() - 0.5) * 5 * energy : 0;
            
            // 优化：振幅系数从 0.22 降为 0.11 (降低50%)
            const amplitude = (h * 0.11 * config.amp) * energy * envelope;
            
            const wave1 = Math.sin(x * config.freq + this.phaseOffset * (1 + i * 0.1) + i);
            const wave2 = Math.sin(x * config.freq * 2.5 - this.phaseOffset * 0.4) * 0.3;
            
            return centerY + yOffset + ((wave1 + wave2) * amplitude) + jitter;
        };

        let currentX = depthX;
        let currentY = getY(0);
        ctx.moveTo(currentX, currentY);

        for (let j = 0; j < points; j++) {
            const nextX = depthX + (j + 1) * step;
            const nextY = getY(nextX);
            // Midpoint approximation for smooth curves with fewer points
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