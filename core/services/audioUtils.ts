
/**
 * File: core/services/audioUtils.ts
 * Version: 1.7.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
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
 * Adaptive Noise Filter
 * 
 * Features:
 * 1. Environmental Profiling: Learns the "shape" of constant background noise (fans, AC, hum).
 * 2. Asymmetric Adaptation: Adapts quickly to silence (drops floor) but slowly to sound (avoids filtering music).
 * 3. Spectral Subtraction: Subtracts the learned noise profile from the signal.
 */
export class AdaptiveNoiseFilter {
  private noiseProfile: Float32Array;
  // Alpha coefficients for Exponential Moving Average (EMA)
  private readonly alphaUp = 0.0005; // Extremely slow adaptation to rising levels (keeps music safe)
  private readonly alphaDown = 0.05; // Fast adaptation to dropping levels (finds new silence floor)
  private readonly sensitivityMargin = 5; // Additional safety buffer

  constructor(fftSize: number = 512) {
    // Initialize profile with zeros. 
    // It maps 1:1 to frequency bins (half of fftSize in AnalyserNode context usually, but we resize dynamically)
    this.noiseProfile = new Float32Array(fftSize).fill(0);
  }

  public process(data: Uint8Array) {
    const len = data.length;
    
    // Dynamic resizing if FFT size changes
    if (this.noiseProfile.length !== len) {
      this.noiseProfile = new Float32Array(len).fill(0);
    }

    // 1. Kill DC Offset (Bin 0) immediately
    if (len > 0) data[0] = 0;

    for (let i = 1; i < len; i++) {
      const val = data[i];
      const floor = this.noiseProfile[i];

      // 2. Update Noise Profile (Learning Phase)
      if (val < floor) {
        // Signal dropped below current floor -> noise floor is actually lower
        this.noiseProfile[i] = floor * (1 - this.alphaDown) + val * this.alphaDown;
      } else {
        // Signal is above floor -> could be music OR noise increasing
        // Adapt VERY slowly to avoid treating a long synth note as noise
        this.noiseProfile[i] = floor * (1 - this.alphaUp) + val * this.alphaUp;
      }

      // 3. Spectral Subtraction (Filtering Phase)
      // We subtract the learned floor plus a small margin.
      // We also apply a slight spectral tilt (more aggressive on highs) for hiss reduction.
      const spectralTilt = (i / len) * 3; 
      const threshold = this.noiseProfile[i] + this.sensitivityMargin + spectralTilt;

      let newVal = val - threshold;

      if (newVal <= 0) {
        newVal = 0;
      } else {
        // 4. Soft Expander / Make-up Gain
        // Restore dynamic range for signals that pass the gate
        newVal *= 1.1; 
      }

      data[i] = newVal > 255 ? 255 : Math.floor(newVal);
    }
  }
}

/**
 * Legacy stateless noise gate. 
 * Kept for backward compatibility or simple use cases.
 */
export function applyNoiseFloor(data: Uint8Array, baseThreshold: number) {
  const len = data.length;
  const range = 255 - baseThreshold;
  const scale = 255 / (range > 0 ? range : 1);

  if (len > 0) data[0] = 0;

  for (let i = 1; i < len; i++) {
    let val = data[i];
    const spectralThreshold = baseThreshold + (i / len) * 20;

    if (val < spectralThreshold) {
      val = 0;
    } else {
      val = (val - spectralThreshold) * scale;
    }
    data[i] = val > 255 ? 255 : Math.floor(val);
  }
}
