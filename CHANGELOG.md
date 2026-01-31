
# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.8.22]

### 🐛 Bug Fixes & Stability
*   **Ocean Wave Stability:** Fixed a critical bug where changing the FFT Size while in Ocean Wave mode would cause the visualizer to freeze due to buffer size mismatch.
*   **AI Control Decoupling:** Decoupled the "Show Lyrics" toggle from the "AI Analysis" background process.
    *   **AI Analysis (Input Panel):** Controls whether Gemini actively listens to and analyzes the audio for genre, mood, and metadata.
    *   **Show Lyrics (Library Panel):** Controls only the visibility of the UI overlay (lyrics text and song info card).
    *   This allows users to enjoy AI-driven visual reactivity (mood-based colors/speed) without the text overlay cluttering the screen.

## [v1.8.21]

### 🚀 Visual Engine Optimization
*   **Silk Wave (WebGL):** Optimized the "Silk Wave" visualizer mode by significantly reducing the layer count to 5. This provides a cleaner, more distinct "fiber optic" aesthetic and improves performance on all devices while maintaining the stereo separation effect.

## [v1.8.20]

### 🔊 Audio Engine
*   **Dynamic Headroom Management:** Upgraded `DynamicPeakLimiter` with an intelligent "Fatigue" system. When audio volume remains consistently high (e.g., modern "brick-wall" mastering), the engine automatically increases headroom. This lowers the base visual intensity, allowing peaks and transients to still punch through, effectively solving the "stuck at 100%" issue.

## [v1.8.19]

### 🚀 Visual Engine Optimization
*   **Digital Grid:** Reduced maximum sensitivity by 50% to prevent visual over-saturation at high volumes, ensuring the "LED Wall" effect remains distinct and controlled.

## [v1.8.18]
...
