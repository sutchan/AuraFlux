
/**
 * File: core/services/audioUtils.ts
 * Version: 1.0.5
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
