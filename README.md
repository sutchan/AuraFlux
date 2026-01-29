
# Aura Flux 🎵👁️

### AI-Powered 3D Music Visualizer & Synesthesia Engine (v1.8.9)

[中文文档](README_ZH.md) | [Live Demo](https://aura.tanox.net/) | [Changelog](CHANGELOG.md)

<!-- README.md -->

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Three.js-WebGL-white?logo=three.js&logoColor=black" />
  <img src="https://img.shields.io/badge/AI-Gemini%203-8E75B2?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Perf-OffscreenCanvas-orange" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" />
</p>

**Aura Flux** is a next-generation web application that transforms audio into immersive, generative 3D art. It fuses high-precision real-time spectral analysis with **Google Gemini 3** intelligence to create a "Synesthesia Engine"—a system that doesn't just react to sound, but understands its mood, genre, and texture.

Capable of rendering 15+ distinct visual engines at 60FPS using multi-threaded **OffscreenCanvas** and **WebGL**, it runs entirely in your browser.

---

## ✨ Key Features

*   **🧠 AI Synesthesia:** Powered by Gemini 3.0 Flash, Aura Flux listens to your audio to identify tracks, analyze emotional context (mood), and extract lyrics in real-time.
*   **🎨 Generative Visual Engines:**
    *   **WebGL 3D:** Neural Flow, Kinetic Wall, Cube Field, Liquid Core.
    *   **Classic 2D:** Digital Waveform, Deep Nebula, Retro Lasers, Spectrum Bars.
*   **🎥 Recording Studio:** Built-in high-fidelity video recorder. Capture your sessions in **4K/1080p** (WebM/MP4) with internal audio sync—perfect for creating social media clips or music videos.
*   **🎵 Smart Player:** Drag & drop local audio files. Includes full **ID3 Metadata** support (Album Art, Artist, Title) and playlist management.
*   **🎛️ Advanced Customization:** Fine-tune sensitivity, smoothing, speed, colors, and bloom effects. Use "Smart Presets" (Cyberpunk, Zen, Party) for instant vibes.
*   **🛡️ Edge-First Privacy:** Audio processing happens locally in your browser via Web Audio API. Audio data is never stored on servers.

---

## 🌟 Application Scenarios

Unlock the potential of generative audio-reactive art in your daily life and creative workflows:

### 🎙️ Content Creation & Streaming
*   **OBS / Streamlabs:** Use as a transparent, reactive background layer for Twitch/YouTube streams.
*   **Music Videos:** Generate instant, high-quality visualizations for your music tracks using the **Recording Studio**.
*   **Podcast Visualizer:** Create engaging video snippets for audio-only content.

### 🎛️ Live Performance & VJing
*   **Browser-Based VJ Tool:** No heavy software installation required. Connect a projector and press `F` for fullscreen.
*   **Concerts & Clubs:** Use the "Kinetic Wall" or "Lasers" modes to drive massive LED walls with real-time audio reactivity.

### 🏠 Ambient Computing & Lifestyle
*   **Living Room Art:** Cast to your TV to turn your home into an immersive audiovisual lounge.
*   **Focus & Flow:** Switch to "Deep Nebula" or "Fluid Curves" for a calming, hypnotic backdrop ideal for coding, reading, or meditation.
*   **Digital Decor:** Run on a wall-mounted display or tablet as an always-on digital art piece.

### 📚 Education & Tech
*   **Physics Visualization:** Demonstrate sound waves, frequency spectrums, and fluid dynamics interactively.
*   **Tech Demos:** Showcase the power of WebGL and Web Workers on modern devices.

---

## 🎮 How to Use

**🚀 Instant Access:** Open **[aura.tanox.net](https://aura.tanox.net/)** on Chrome, Edge, or Safari.

1.  **Select Source:**
    *   **Mic:** Captures system audio or microphone input (great for Spotify/YouTube playing in another tab).
    *   **File:** Drag & drop MP3/WAV/FLAC files for high-quality internal playback.
2.  **Visual Control:**
    *   Press `H` to open the **Control Panel**.
    *   Click **Smart Presets** to instantly change the vibe.
    *   Use **Advanced Mode** to tweak specific parameters like `Sensitivity` or `Glow`.
3.  **AI Powers:**
    *   Press `L` or click the "AI Synesthesia" toggle to identify the current song and analyze its mood.
    *   *Note: Requires a Gemini API Key for full functionality.*
4.  **Record:**
    *   Open the **Studio** tab to record clips of your visualization.

---

## 🛠️ Tech Stack

*   **Core:** React 19, TypeScript, Vite 6.
*   **Graphics:** Three.js, React Three Fiber, Postprocessing (Bloom, Noise).
*   **Performance:** Web Workers & OffscreenCanvas for main-thread-free rendering.
*   **AI:** Google GenAI SDK (Gemini 3 Flash).
*   **Audio:** Web Audio API (AnalyserNode, AudioWorklet), jsmediatags.

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---
*Made with 💜 using React and Google Gemini API*
