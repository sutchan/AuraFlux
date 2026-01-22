# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.7.3] - 2025-02-24

### UI & UX
*   **📱 Mobile Layout Fix:** Resolved an overlap issue where the "AI ANALYZING" status badge obscured the song title/artist overlay. The badge now appears at the bottom center on mobile devices.
*   **🖥️ Desktop Refinement:** Moved the "AI ANALYZING" badge to the top-right corner on desktop layouts to keep the song info area (top-left) clean.
*   **🎨 Toast Notifications:** Implemented a new, lightweight notification system for user actions (Save, Copy, Export).

### Features
*   **💾 Preset Management:** Added ability to **Delete** and **Rename** user presets in the System panel.
*   **⚙️ Settings UI:** Reorganized action buttons (Export/Import/Copy) into a cleaner grid layout.

## [v1.6.91] - 2025-02-23

### Core & Stability
*   **🌍 i18n Synchronization:** Fully synchronized all 10 language files (TW, JA, ES, KO, DE, FR, AR, RU) to include latest UI keys (`customTextCycleColor`, `cycleSpeed`, `textPosition`).
*   **🛡️ Robustness:** Enhanced `geminiService` with strict API Key validation to prevent empty requests.
*   **🔊 Audio Engine:** Improved `useAudio` hook with visibility-change detection to auto-resume suspended AudioContexts (fixes iOS Safari silence issue).

### Features
*   **🌈 Text Color Spectrum:** Added automated color cycling for custom text overlay.
*   **📍 UI Positioning:** Enabled granular positioning control for both Custom Text and AI Lyrics overlays.

## [v1.6.90] - 2025-02-23
...