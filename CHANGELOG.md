# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.7.7] - 2025-02-24

### Stabilization
*   **🛡️ Error Handling:** Enhanced robustness for AI service quotas. Added specific handling for "Quota Exceeded" errors to prevent app crashes and provide user feedback.
*   **🌍 i18n Perfected:** Completed translation of all UI tooltips (sliders, selects) across all 10 supported languages (ZH, TW, JA, KO, ES, DE, FR, RU, AR).

### Visuals
*   **🧠 Neural Flow Optimization:** Tuned responsiveness parameters (reduced max displacement by 50%) to prevent visual distortion during high-volume transients.

## [v1.7.6] - 2025-02-24

### Features
*   **🚀 Groq Integration:** Added support for **Groq** as a high-speed AI provider. Implements a two-stage pipeline using `distil-whisper-large-v3-en` for transcription and `llama-3.3-70b` for semantic analysis.
*   **🎧 Multi-Source Audio:** Expanded "AI Recognition" options to include Gemini (Native), OpenAI (GPT-4o Audio), and Groq (Whisper+Llama).

### UI & UX
*   **🌍 i18n Expansion:** Updated all 10 language files (EN, ZH, TW, JA, ES, KO, DE, FR, AR, RU) to support the new provider hints.
*   **🔑 Key Management:** UI now dynamically shows specific hints based on the selected AI provider (e.g., reminding users that Groq keys start with `gsk_`).

## [v1.7.5] - 2025-02-24

### Features
*   **🔑 API Key Management:** Users can now securely save independent API Keys for different providers (Gemini, OpenAI) in local storage.
*   **🎯 Accuracy Boost:** Refined system prompts to prioritize lyrics transcription for significantly better song identification.

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
