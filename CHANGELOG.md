# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.7.25] - 2025-02-28

### Robustness & Internationalization
*   **🧩 Full WebGL Mode Integration:** Fixed a critical robustness issue by fully integrating the `Cyber City` and `Crystal Core` WebGL modes, which were defined but not implemented in the rendering pipeline.
*   **🌍 100% I18N Completion:** All internationalization strings across 10 languages are now fully populated, including the newly integrated modes and more descriptive preset names.
*   **💡 Preset Naming:** Renamed "Smart Presets" in all languages to better reflect the visualizer they activate (e.g., "Hypnotic Calm" is now "Digital Waveform"), improving user clarity.

## [v1.7.23] - 2025-02-26

### Internationalization & Robustness
*   **🌍 Full I18N Sync:** Completed and verified translations for all 10 supported languages (ZH, TW, JA, KO, ES, DE, FR, RU, AR). The application now offers a fully localized experience, including all tooltips, panel text, and onboarding instructions.
*   **🛡️ AI Schema Hardening:** Added a dedicated `mood_en_keywords` field to the AI response schema. This ensures consistent UI styling based on mood, regardless of the display language, fixing a critical internationalization bug.

## [v1.7.10] - 2025-02-26

### Optimization
*   **⚡ Performance-Aware Randomization:** Re-engineered the "Smart Random" algorithm. When switching to high-resource modes (like Kinetic Wall or Neural Flow), the system now intelligently reduces the probability of enabling "Neon Bloom" and "Motion Trails" to ensure consistent 60FPS performance on varied hardware.

## [v1.7.7] - 2025-02-24

### Stabilization
*   **🛡️ Error Handling:** Enhanced robustness for AI service quotas. Added specific handling for "Quota Exceeded" errors to prevent app crashes and provide user feedback.
*   **🌍 i18n Perfected:** Completed translation of all UI tooltips (sliders, selects) across all 10 supported languages (ZH, TW, JA, KO, ES, DE, FR, RU, AR).

### Visuals
*   **🧠 Neural Flow Optimization:** Tuned responsiveness parameters (reduced max displacement by 50%) to prevent visual distortion during high-volume transients.
... (rest of the file unchanged)