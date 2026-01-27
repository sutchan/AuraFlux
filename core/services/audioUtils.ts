/**
 * File: core/services/audioUtils.ts
 * Version: 1.7.46
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 17:00
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
