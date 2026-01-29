
# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.8.11]

### Feature & Design
*   **🎨 Visuals:** Refined the color palette by removing less popular themes, now offering a curated list of 18 premium themes. Updated Smart Presets to align with the new color indices.
*   **🌍 Localization:** Validated integrity of all 10 language packs. Renamed "Text" tab to "Info Layer" for clarity.
*   **🤖 AI:** Updated "Auto-Director" prompt to focus strictly on sonic characteristics (genre, BPM, mood) instead of attempting to guess song metadata, ensuring more creative visual results.

### UI/UX
*   **🖼️ Playback:** Moved "Album Art Background" and "Cover Overlay" toggles to the Playback Panel for better context awareness during file playback.
*   **⚡ Performance:** Optimized `COLOR_THEMES` loading to ensure robustness against legacy index references in user local storage.

## [v1.8.10]

### UI/UX
*   **🎨 Playback:** Optimized the Library panel layout. Removed rigid height constraints on the main container and applied specific limits to the playlist card (max-h-420px), ensuring the right-side scrollbar appears correctly for long lists without stretching the entire UI.
*   **📝 Terminology:** Renamed the "Input" tab to "Audio" across all languages. This better reflects its role as a hub for both input selection (Mic/File) and audio analysis tuning (FFT/Smoothing).

### Fix
*   **🔊 Audio:** Fixed a critical audio feedback loop issue where the microphone input was inadvertently routed to the speakers when switching modes. The analyzer connection is now properly disconnected before switching sources.

## [v1.8.9]
...
