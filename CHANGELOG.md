# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.6.80] - 2025-02-22

### Polish & Robustness
*   **🌍 i18n Refinement:** Enhanced localization for Asian languages. Updated "BETA" terminology to "ベータ" (Japanese) and "베타" (Korean) for better native integration.
*   **🛡️ Renderer Safety:** Added zero-dimension boundary checks to `NebulaRenderer` and `MacroBubblesRenderer` to prevent potential division-by-zero or calculation errors when the window is minimized or hidden.
*   **📄 Spec Sync:** Synchronized OpenSpec documentation suite to reflect the latest renderer parameters (v1.6.80).

## [v1.6.79] - 2025-02-22

### Optimized
*   **🫧 Macro Bubbles (Ethereal):** Increased overall transparency to create a lighter, more soap-bubble-like aesthetic. Maximum rim opacity reduced to 0.7, and center opacity reduced to near-invisible 0.002.

## [v1.6.78] - 2025-02-22

### Optimized
*   **🫧 Macro Bubbles (Transparency):** Significantly increased transparency variance by 2x. Centers are now nearly invisible (0.005 opacity) while rims are sharper (up to 0.98 opacity), creating a deep, glass-like hollow effect. Sharpness curve steepened to 3.5.

## [v1.6.77] - 2025-02-21
...