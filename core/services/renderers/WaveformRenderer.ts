/**
 * File: core/services/renderers/WaveformRenderer.ts
 * Version: 2.5.0
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-18 17:45
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils';

export class WaveformRenderer implements IVisualizerRenderer {
  private smoothedEnergies: number[] = new Array(6).fill(0);
  private maxEnergyObserved = 0.1; // 自适应增益参考值
  private phaseOffset = 0; // 独立相位，受节拍冲击

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
    
    // --- 1. 技术优化：自适应增益 (Auto-Gain) ---
    const globalEnergy = getAverage(data, 0, data.length) / 255;
    this.maxEnergyObserved = Math.max(0.05, this.maxEnergyObserved * 0.998, globalEnergy);
    const autoGainScale = 0.2 / this.maxEnergyObserved; // 归一化到约 20% 振幅

    // --- 2. 动态特性：节拍瞬态爆发 ---
    const beatImpact = beat ? 0.3 : 0;
    this.phaseOffset += (settings.speed * 0.04) + beatImpact;

    const configs = [
        { start: 0, end: 6, amp: 0.9, freq: 0.003, width: 6, gain: 1.0, z: 1.2 },    // Sub-Bass
        { start: 7, end: 20, amp: 0.75, freq: 0.008, width: 4.5, gain: 1.2, z: 1.1 }, // Bass
        { start: 25, end: 60, amp: 0.6, freq: 0.015, width: 3.5, gain: 1.5, z: 1.0 }, // Low-Mids
        { start: 65, end: 110, amp: 0.45, freq: 0.03, width: 2.5, gain: 1.8, z: 0.9 }, // Mids
        { start: 120, end: 180, amp: 0.35, freq: 0.06, width: 1.8, gain: 2.5, z: 0.8 }, // Highs
        { start: 190, end: 255, amp: 0.2, freq: 0.12, width: 1.2, gain: 4.0, z: 0.7 }  // Air
    ];

    for (let i = 0; i < layerCount; i++) {
        const config = configs[i];
        const color = colors[i % colors.length];
        
        // 耦合局部与全局能量
        const localEnergy = getAverage(data, config.start, config.end) / 255;
        const coupling = i > 3 ? 0.25 : 0; 
        const combined = (localEnergy * (1 - coupling) + globalEnergy * coupling) * config.gain * autoGainScale;
        
        const targetEnergy = Math.pow(combined * settings.sensitivity, 1.2);
        const lerpFactor = targetEnergy > this.smoothedEnergies[i] ? 0.2 : 0.04;
        this.smoothedEnergies[i] += (targetEnergy - this.smoothedEnergies[i]) * lerpFactor;
        
        const energy = this.smoothedEnergies[i];
        
        // --- 3. 视觉质感：伪 3D 深度感 (Parallax) ---
        const depthX = Math.sin(rotation * 0.5 + i) * 20 * config.z;
        const yOffset = (i - (layerCount - 1) / 2) * (h * 0.04); 

        // --- 4. 视觉质感：变长度渐变描边 ---
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.strokeStyle = grad;
        // 宽度随能量爆发
        ctx.lineWidth = config.width * (0.8 + energy * 0.8) * config.z;
        ctx.globalAlpha = (0.2 + energy * 0.8) * (settings.glow ? 1.0 : 0.6);

        const points = settings.quality === 'high' ? 120 : 60;
        const step = w / points;

        const getY = (x: number) => {
            // --- 5. 动态特性：包络调制 (Envelope Shaping) ---
            // 波形在屏幕中心最强，两端消失
            const envelope = Math.sin((x / w) * Math.PI);
            
            // --- 6. 动态特性：非线性随机噪声 (Jitter) ---
            const jitter = i > 4 ? (Math.random() - 0.5) * 5 * energy : 0;

            const amplitude = (h * 0.5 * config.amp) * energy * envelope;
            
            // 复合波形合成
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