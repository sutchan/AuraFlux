
# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.8.16]

### 🚀 Visual Engine Optimization
*   **Cellular Drift (Macro Bubbles):** Overhauled with organic cell textures (nucleus/membrane), depth-of-field parallax, and fluid dynamics for a true microscopic feel.
*   **Spectral Silk (Waveform):** Refined to 5 high-fidelity ribbons. Optimized frequency mapping (Sub/Bass/Mids/Highs) and reduced sensitivity by 50% for elegant headroom.

### 🛡️ System & Maintenance
*   **i18n:** Validated integrity of all 10 language packs.
*   **Robustness:** Verified stability for WebGL context loss recovery and audio device hot-swapping.

## [v1.8.13]

### Feature & Design
*   **UI/UX:** Updated the Control Panel tab order to better align with the workflow: Visual -> Audio -> Info Layer -> Playback -> Studio -> System. This places the "Info Layer" closer to the "Audio" source controls.
*   **Documentation:** Updated keyboard shortcut guides in Help and Onboarding to reflect the new tab range (1-6).

## [v1.8.12]

### Fix
*   **🎵 Playback:** Fixed an issue where the "Clear Queue" confirmation dialog might display `undefined` if localization was still loading. Added a robust fallback string to ensure the action can always be confirmed.
*   **UI/UX:** Synchronized the height and behavior of the playlist pop-up in the Mini Bar (Bottom Bar) with the main Playback Panel for a consistent user experience (~6 rows visible).

## [v1.8.11]

### Feature & Design
*   **🎨 Visuals:** Refined the color palette by removing less popular themes, now offering a curated list of 18 premium themes. Updated Smart Presets to align with the new color indices.
*   **🌍 Localization:** Validated integrity of all 10 language packs. Renamed "Text" tab to "Info Layer" for clarity.
*   **🤖 AI:** Updated "Auto-Director" prompt to focus strictly on sonic characteristics (genre, BPM, mood) instead of attempting to guess song metadata, ensuring more creative visual results.

### UI/UX
*   **🖼️ Playback:** Moved "Album Art Background" and "Cover Overlay" toggles to the Playback Panel for better context awareness during file playback.
*   **⚡ Performance:** Optimized `COLOR_THEMES` loading to ensure robustness against legacy index references in user local storage.

## [v1.8.10]
...
