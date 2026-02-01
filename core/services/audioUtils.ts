/**
 * File: core/services/audioUtils.ts
 * Version: 1.8.51
 * Author: Sut
  */

export function getAverage(data: Uint8Array, start: number, end: number) {
  let sum = 0;
  const safeEnd = Math.min(end, data.length);
  const safeStart = Math.min(start, safeEnd);
  if (safeEnd === safeStart) return 0;
  for(let i=safeStart; i<safeEnd; i++) sum += data[i];
  return sum / (safeEnd - safeStart);
}

export function applySoftCompression(val: number, power: number = 0.75): number {
    return Math.pow(Math.min(val, 1.0), power);
}

export function drawQuadraticPath(ctx: any, points: {x: number, y: number}[]) {
    if (points.length < 2) return;
    ctx.moveTo(points[0].x, points[0].y);
    for (let j = 0; j < points.length - 1; j++) {
        const xc = (points[j].x + points[j + 1].x) / 2;
        const yc = (points[j].y + points[j + 1].y) / 2;
        ctx.quadraticCurveTo(points[j].x, points[j].y, xc, yc);
    }
    ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
}

export class AdaptiveNoiseFilter {
  private noiseProfile: Float32Array = new Float32Array(0);
  public process(data: Uint8Array) {
    const len = data.length;
    if (this.noiseProfile.length !== len) this.noiseProfile = new Float32Array(len).fill(0);
    if (len > 0) data[0] = 0;
    for (let i = 1; i < len; i++) {
      const val = data[i], floor = this.noiseProfile[i], diff = val - floor;
      if (diff < 0) this.noiseProfile[i] = floor + diff * 0.1;
      else if (diff <= 15) this.noiseProfile[i] = floor + diff * 0.001;
      let newVal = val - (this.noiseProfile[i] + 10 + (i / len) * 8.0);
      data[i] = newVal <= 0 ? 0 : (newVal * 1.15 > 255 ? 255 : Math.floor(newVal * 1.15));
    }
  }
}

export class DynamicPeakLimiter {
    // @fix: ESBuild requires separate declarations for properties with access modifiers
    private maxPeak: number = 0.5;
    private decay: number = 0.995;
    private fatigue: number = 0.0;

    process(currentEnergy: number): number {
        if (currentEnergy > this.maxPeak) this.maxPeak = currentEnergy;
        else this.maxPeak *= this.decay;
        if (currentEnergy > Math.max(this.maxPeak, 0.1) * 0.85) this.fatigue += 0.005;
        else this.fatigue *= 0.98;
        return 1.0 / (Math.max(this.maxPeak, 0.1) * (1.0 + Math.max(0, Math.min(this.fatigue, 0.5))));
    }
}

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels, length = buffer.length * numOfChan * 2 + 44, bufferArr = new ArrayBuffer(length), view = new DataView(bufferArr), channels = [];
  for(let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
  let pos = 0;
  const setU32 = (d: number) => { view.setUint32(pos, d, true); pos += 4; };
  const setU16 = (d: number) => { view.setUint16(pos, d, true); pos += 2; };
  setU32(0x46464952); setU32(length - 8); setU32(0x45564157); setU32(0x20746d66); setU32(16); setU16(1); setU16(numOfChan);
  setU32(buffer.sampleRate); setU32(buffer.sampleRate * 2 * numOfChan); setU16(numOfChan * 2); setU16(16); setU32(0x61746164); setU32(length - 44);
  let offset = 44;
  for(let p=0; p<buffer.length; p++) {
    for(let c=0; c<numOfChan; c++) {
      let sample = Math.max(-1, Math.min(1, channels[c][p]));
      view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
      offset += 2;
    }
  }
  return new Blob([bufferArr], { type: 'audio/wav' });
}