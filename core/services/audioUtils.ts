
/**
 * File: core/services/audioUtils.ts
 * Version: 1.8.20
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-18 12:00
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
 * Features:
 * - Dynamic Noise Floor Learning: Fast attack for silence, slow decay for noise drift.
 * - Signal Discrimination: Prevents learning loud music as noise.
 * - Spectral Tilt: Applies stronger gating to high frequencies to remove hiss.
 */
export class AdaptiveNoiseFilter {
  private noiseProfile: Float32Array;
  
  // Adaptation rates
  private readonly alphaUp = 0.001;   // Slow drift up (to adapt to rising environmental noise)
  private readonly alphaDown = 0.1;   // Fast drop (to quickly recognize silence)
  
  // Base threshold offset (0-255 scale)
  private readonly sensitivityMargin = 10; 
  
  // Signal-to-Noise ratio threshold to pause adaptation
  // If signal is this much louder than noise floor, we assume it's music and stop learning it as noise.
  private readonly musicThreshold = 15; 

  constructor(fftSize: number = 512) {
    this.noiseProfile = new Float32Array(fftSize).fill(0);
  }

  public process(data: Uint8Array) {
    const len = data.length;
    if (this.noiseProfile.length !== len) {
      this.noiseProfile = new Float32Array(len).fill(0);
    }

    if (len > 0) data[0] = 0; // Kill DC Offset

    for (let i = 1; i < len; i++) {
      const val = data[i];
      const floor = this.noiseProfile[i];
      const diff = val - floor;

      // --- 1. Smart Noise Floor Update ---
      if (diff < 0) {
        // Signal is quieter than current noise profile -> It's a new lower noise floor.
        // Update quickly to capture silence gaps.
        this.noiseProfile[i] = floor + diff * this.alphaDown;
      } else if (diff > this.musicThreshold) {
        // Signal is significantly louder -> Likely music/speech.
        // Do NOT update noise floor (or update extremely slowly) to preserve dynamics.
        // This prevents the filter from "eating" the music during sustained loud parts.
      } else {
        // Signal is slightly above noise -> Likely rising environmental noise (e.g., fan spinning up).
        // Drift up slowly.
        this.noiseProfile[i] = floor + diff * this.alphaUp;
      }

      // --- 2. Threshold Calculation with Spectral Tilt ---
      // Hiss/Static is usually high frequency. We apply a stricter threshold for higher bins.
      // 0 at bass, +8 at max treble.
      const spectralTilt = (i / len) * 8.0; 
      const threshold = this.noiseProfile[i] + this.sensitivityMargin + spectralTilt;

      // --- 3. Gating & Expansion ---
      let newVal = val - threshold;
      
      if (newVal <= 0) {
        newVal = 0; // Hard gate for sub-threshold noise
      } else {
        // Slight expansion to pop the signal out of the black background
        newVal *= 1.15; 
      }
      
      data[i] = newVal > 255 ? 255 : Math.floor(newVal);
    }
  }
}

/**
 * Peak Limiter Utility with Headroom Management
 * Tracks recent peaks and provides a normalization factor.
 * Includes "Fatigue" logic to lower gain during sustained loud passages.
 */
export class DynamicPeakLimiter {
    private maxPeak = 0.5;
    private decay = 0.995; // Slow peak decay
    private fatigue = 0.0; // Tracks sustained loudness

    process(currentEnergy: number): number {
        // 1. Peak Envelope Follower
        if (currentEnergy > this.maxPeak) {
            this.maxPeak = currentEnergy; // Instant attack
        } else {
            this.maxPeak *= this.decay; // Decay
        }

        // Ensure strictly positive floor to avoid division by zero
        const safePeak = Math.max(this.maxPeak, 0.1);

        // 2. Fatigue / Headroom Logic
        // If current energy consistently pushes against the peak ceiling (Wall of Sound),
        // we build up "fatigue" to lower the gain. This creates headroom for transients.
        const threshold = safePeak * 0.85;
        if (currentEnergy > threshold) {
            // Build up fatigue linearly
            this.fatigue += 0.005;
        } else {
            // Recover from fatigue exponentially
            this.fatigue *= 0.98;
        }
        // Cap fatigue (max 50% extra headroom/gain reduction)
        this.fatigue = Math.max(0, Math.min(this.fatigue, 0.5));

        // 3. Calculate Gain
        // We effectively raise the ceiling based on fatigue.
        // Example: Peak=1.0, Fatigue=0.5 -> Effective Ceiling = 1.5 -> Gain = 0.66
        const effectiveCeiling = safePeak * (1.0 + this.fatigue);
        
        // Return normalization factor
        return 1.0 / effectiveCeiling;
    }
}

/**
 * Converts an AudioBuffer (or part of it) to a standard WAV Blob.
 * Used for sending high-fidelity audio snippets to Gemini AI.
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan);  // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit (hardcoded in this impl)

  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  // write interleaved data
  for(i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while(pos < buffer.length) {
    for(i = 0; i < numOfChan; i++) {             // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
      view.setInt16(44 + offset, sample, true);  // write 16-bit sample
      offset += 2;
    }
    pos++;
  }

  return new Blob([bufferArr], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}
