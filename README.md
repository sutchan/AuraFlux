# Aura Flux 🎵👁️

### AI-Powered 3D Music Visualizer & Synesthesia Engine (v1.8.66)

Aura Flux is a professional-grade web application that transmutes audio frequencies into high-fidelity generative art. Powered by **React 18**, **Three.js**, and **Google Gemini 3 AI**, it offers a seamless blend of performance and intelligence.

## 🚀 Key Features

- **Hybrid Rendering Pipeline:** Switch between high-fidelity WebGL 3D scenes (R3F) and optimized Offscreen 2D Canvas renderers.
- **AI Synesthesia HUD:** Real-time song identification, mood analysis, and dynamic lyrics powered by Gemini 3.0 Flash.
- **4K Studio Recording:** Export your visual creations in high resolution (up to 4K) with custom bitrate and audio mixing.
- **Bento Interface:** A modular, responsive control system designed for professional VJing.
- **Local-First Privacy:** All spectral analysis and rendering occur locally on your device.

## 🎭 Usage Scenarios

### 1. Live VJ & Stage Performance
Perfect for live DJ sets, concerts, or club environments. 
- **Setup:** Connect your laptop to a large LED wall or projector.
- **Workflow:** Use "Kinetic Wall" or "Digital Grid" for high-impact rhythmic beats. Map the VJ controls to your MIDI controller or use the built-in hotkeys to switch engines and palettes live without looking at the screen.
- **Edge:** Real-time response with zero latency between audio input and visual movement.

### 2. Short-Form Content Creation (TikTok/Reels/Shorts)
Create stunning, viral-ready music videos in minutes.
- **Setup:** Switch to 9:16 aspect ratio in the **Studio** tab.
- **Workflow:** Record in 4K with **AI Lyrics** enabled. The text will pulse and glow in sync with the song's energy, providing professional-grade motion graphics that usually require hours in After Effects.
- **Edge:** AI Synesthesia automatically picks the "vibe" that best fits the track.

### 3. Atmospheric Decor & Ambient Lighting
Turn an unused tablet or smart mirror into a piece of living digital art.
- **Setup:** Open Aura Flux on a browser, toggle Fullscreen (`F`), and enable **Auto-Rotate** mode.
- **Workflow:** Pair with ambient or lo-fi playlists. Engines like "Silk Wave" and "Nebula" create a soothing, ever-changing environment.
- **Edge:** Low power consumption in "Eco" mode while maintaining smooth 60FPS motion.

### 4. Meditation & Mental Wellness
Use generative visuals as a focal point for breathing exercises and mindfulness.
- **Setup:** Use "Ocean Wave" or "Fluid Curves" with soft, monochromatic palettes.
- **Workflow:** Enable **Custom Text** to display mantras or breathing prompts. The pulsing text serves as a rhythmic guide for inhale/exhale cycles.
- **Edge:** Synesthetic feedback helps users "see" the music, deepening the immersive experience.

### 5. Professional Audio Spectrum Analysis
A powerful tool for music producers and audiophiles to visualize frequency distribution.
- **Setup:** Switch to "Bars" or "Digital Grid" in Advanced UI mode.
- **Workflow:** Adjust FFT size and sensitivity to see detailed harmonics. The high-fidelity spectrum mapping helps identify frequency peaks and stereo width in real-time.

## 🛠️ Tech Stack

- **Core:** React 18, TypeScript 5.7, Vite 6
- **Graphics:** Three.js, React Three Fiber (R3F), Post-processing
- **AI:** Google GenAI SDK (Gemini 3 Flash, Gemini 2.5 Flash Image)
- **Audio:** Web Audio API, `jsmediatags` for ID3 metadata

## 🎹 Hotkeys (VJ Controls)

| Key | Action |
| :--- | :--- |
| `Space` | Toggle Microphone / Playback |
| `F` | Toggle Fullscreen |
| `L` | Toggle AI Lyrics & Info HUD |
| `H` | Toggle HUD visibility |
| `R` | Randomize Aesthetics |
| `← →` | Cycle Visual Engines |
| `[ ]` | Cycle Color Palettes |
| `1 - 6` | Switch Control Panels |

## 📜 Specification

This project follows the **OpenSpec** standard. Full details are available in the `openspec/` directory.

---
*Aura Flux - Developed by Sut*