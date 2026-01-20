
/**
 * File: public/audio-processor.js
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * 
 * AudioWorkletProcessor for extracting real-time audio features
 * directly on the audio rendering thread.
 */

class AudioFeaturesProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._volume = 0;
    this._lastUpdate = currentTime;
    this._smoothingFactor = 0.8;
  }

  process(inputs, outputs, parameters) {
    // Input 0, Channel 0 (Mono processing is sufficient for features)
    const input = inputs[0];
    
    if (input && input.length > 0) {
      const samples = input[0];
      let sum = 0;
      
      // Calculate RMS (Root Mean Square) for volume/energy
      for (let i = 0; i < samples.length; ++i) {
        sum += samples[i] * samples[i];
      }
      const rms = Math.sqrt(sum / samples.length);
      
      // Smooth the volume value
      this._volume = (this._volume * this._smoothingFactor) + (rms * (1 - this._smoothingFactor));

      // Post data to main thread at approx 60fps (every ~0.016s) to reduce bridge traffic
      if (currentTime - this._lastUpdate > 0.016) {
        this.port.postMessage({
          type: 'features',
          data: {
            rms: this._volume,
            energy: rms, // Raw energy for transient detection
            timestamp: currentTime
          }
        });
        this._lastUpdate = currentTime;
      }
    }

    // Keep the processor alive
    return true;
  }
}

registerProcessor('audio-features-processor', AudioFeaturesProcessor);
