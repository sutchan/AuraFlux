/**
 * File: core/services/audioUtils.ts
 * Version: 1.8.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-25 23:00
 */

export function getAverage(data: Uint8Array, start: number, end: number) {
  let sum = 0;
  const safeEnd = Math.min(end, data.length);
  const safeStart = Math.min(start, safeEnd);
  if (safeEnd === safeStart) return 0;
  for(let i=safeStart; i<safeEnd; i++) sum += data[i];
  return sum / (safeEnd - safeStart);
}

/**
 * Applies Soft-Knee Compression to a normalized value (0.0 - 1.0).
 * This prevents the "clipping" effect where visuals stay at the top.
 */
export function applySoftCompression(val: number, power: number = 0.75): number {
    // We use a power law to squash the upper range.
    // At high volumes (val -> 1.0), the growth is slower.
    return Math.pow(Math.min(val, 1.0), power);
}

/**
 * Adaptive Noise Filter
 */
export class AdaptiveNoiseFilter {
  private noiseProfile: Float32Array;
  private readonly alphaUp = 0.0005; 
  private readonly alphaDown = 0.05; 
  private readonly sensitivityMargin = 5; 

  constructor(fftSize: number = 512) {
    this.noiseProfile = new Float32Array(fftSize).fill(0);
  }

  public process(data: Uint8Array) {
    const len = data.length;
    if (this.noiseProfile.length !== len) {
      this.noiseProfile = new Float32Array(len).fill(0);
    }

    if (len > 0) data[0] = 0;

    for (let i = 1; i < len; i++) {
      const val = data[i];
      const floor = this.noiseProfile[i];

      if (val < floor) {
        this.noiseProfile[i] = floor * (1 - this.alphaDown) + val * this.alphaDown;
      } else {
        this.noiseProfile[i] = floor * (1 - this.alphaUp) + val * this.alphaUp;
      }

      const spectralTilt = (i / len) * 3; 
      const threshold = this.noiseProfile[i] + this.sensitivityMargin + spectralTilt;

      let newVal = val - threshold;
      if (newVal <= 0) {
        newVal = 0;
      } else {
        newVal *= 1.1; 
      }
      data[i] = newVal > 255 ? 255 : Math.floor(newVal);
    }
  }
}

/**
 * Peak Limiter Utility
 * Tracks recent peaks and provides a normalization factor.
 */
export class DynamicPeakLimiter {
    private maxPeak = 0.1;
    private decay = 0.992; // Slow decay (approx 3-4 seconds to reset)

    process(currentEnergy: number): number {
        // Update peak
        if (currentEnergy > this.maxPeak) {
            this.maxPeak = currentEnergy;
        } else {
            this.maxPeak *= this.decay;
        }

        // Clamp peak floor to avoid boosting noise
        const effectivePeak = Math.max(this.maxPeak, 0.25);
        
        // Return normalization factor
        return 1.0 / effectivePeak;
    }
}
