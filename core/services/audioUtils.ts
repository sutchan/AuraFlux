
/**
 * File: core/services/audioUtils.ts
 * Version: 1.0.6
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
 * Subtracts a noise floor from the frequency data.
 * Values below the threshold are clamped to 0.
 * Values above are reduced by the threshold to ensure a smooth curve starting from 0.
 * This prevents the visualizer from jittering due to background noise (fans, AC, etc).
 * 
 * @param data The frequency data array (modified in place)
 * @param threshold The noise threshold (0-255). Typical values: 20-40.
 */
export function applyNoiseFloor(data: Uint8Array, threshold: number) {
  const len = data.length;
  for (let i = 0; i < len; i++) {
    const val = data[i];
    // Uint8Array wraps on negative assignment, so we must check explicitly
    data[i] = val < threshold ? 0 : val - threshold;
  }
}
