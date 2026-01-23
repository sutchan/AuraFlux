# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

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