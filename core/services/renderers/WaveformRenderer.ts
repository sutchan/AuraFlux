/**
 * File: core/services/renderers/WaveformRenderer.ts
 * Version: 1.8.25
 * Author: Sut
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage, applySoftCompression, drawQuadraticPath } from '../audioUtils';

export class WaveformRenderer implements IVisualizerRenderer {
  private smoothedEnergiesL: number[] = new Array(5).fill(0);
  private smoothedEnergiesR: number[] = new Array(5).fill(0);
  private maxEnergyObserved = 0.15; 
  private phaseOffset = 0; 

  init() { this.smoothedEnergiesL.fill(0); this.smoothedEnergiesR.fill(0); this.maxEnergyObserved = 0.15; this.phaseOffset = 0; }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean, dataR?: Uint8Array) {
    if (colors.length === 0) return;
    const layerCount = 5, isStereo = !!dataR, centerY = h / 2, effectiveSensitivity = settings.sensitivity * 0.5;
    const gL = getAverage(data, 0, data.length) / 255, gR = isStereo ? getAverage(dataR!, 0, dataR!.length) / 255 : gL;
    this.maxEnergyObserved = Math.max(0.15, this.maxEnergyObserved * 0.995, Math.max(gL, gR));
    const autoGain = 0.25 / this.maxEnergyObserved;
    this.phaseOffset += (settings.speed * 0.04) + (beat ? 0.3 : 0);
    const configs = [
        { start: 0, end: 10, amp: 0.8, freq: 0.003, width: 14.0, gain: 1.0 }, { start: 12, end: 40, amp: 0.8, freq: 0.007, width: 10.0, gain: 1.2 },
        { start: 45, end: 100, amp: 0.7, freq: 0.015, width: 6.0, gain: 1.5 }, { start: 110, end: 180, amp: 0.7, freq: 0.04, width: 4.5, gain: 2.0 }, 
        { start: 190, end: 255, amp: 0.6, freq: 0.09, width: 3.0, gain: 3.5 }  
    ];
    const drawWaves = (channelData: Uint8Array, smoothed: number[], globalE: number, dir: 1 | -1) => {
        for (let i = 0; i < layerCount; i++) {
            const conf = configs[i], localE = applySoftCompression(getAverage(channelData, conf.start, conf.end) / 255, 0.75);
            let combined = (localE * (i > 3 ? 0.8 : 1.0) + globalE * (i > 3 ? 0.2 : 0)) * conf.gain * autoGain;
            const target = Math.max(0, combined) * effectiveSensitivity;
            smoothed[i] += (target - smoothed[i]) * (target > smoothed[i] ? 0.2 : 0.05);
            const energy = smoothed[i], depthX = Math.sin(rotation * 0.5 + i) * 20, points = settings.quality === 'high' ? 90 : 30, step = w / points;
            const grad = ctx.createLinearGradient(0, 0, w, 0); grad.addColorStop(0, 'transparent'); grad.addColorStop(0.5, colors[i % colors.length]); grad.addColorStop(1, 'transparent');
            ctx.beginPath(); ctx.strokeStyle = grad; ctx.lineWidth = conf.width * (0.8 + energy * 0.3); ctx.globalAlpha = (0.2 + energy * 0.5) * (settings.glow ? 0.9 : 0.6);
            const pts = []; for (let j = 0; j <= points; j++) {
                const x = depthX + j * step, env = Math.sin((x / w) * Math.PI), stereoPhase = (isStereo && dir === -1) ? Math.PI : 0;
                const wave = Math.sin(x * conf.freq + this.phaseOffset * (0.5 + i/4) + i + stereoPhase) + Math.sin(x * conf.freq * 2.5 - this.phaseOffset * 0.2);
                pts.push({ x, y: centerY + (isStereo ? dir * h * 0.05 : 0) + (i - 2) * (h * 0.06) + (wave * Math.min(h * 0.15 * conf.amp * energy * env, h * 0.35) * dir) });
            }
            drawQuadraticPath(ctx, pts); ctx.stroke();
        }
    };
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    if (isStereo) { drawWaves(data, this.smoothedEnergiesL, gL, -1); drawWaves(dataR!, this.smoothedEnergiesR, gR, 1); }
    else drawWaves(data, this.smoothedEnergiesL, gL, 1);
    ctx.restore();
  }
}