
# Changelog

All notable changes to the **Aura Vision** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.6.3] - 2025-01-27

### Added
*   **📱 Mobile Gestures:** Introduced swipe controls for changing modes (Horizontal) and sensitivity (Vertical), plus long-press for AI activation.
*   **🌐 i18n & Help:** Updated Help Modal with dedicated touch gesture instructions across all 10 supported languages.

### Fixed
*   **🛡️ Robustness:** Added `touch-action: none` to the main viewport to prevent unwanted browser scrolling/navigation during gesture interaction.
*   **🔖 Versioning:** Synchronized version numbers across all project files to v1.6.3.

## [v1.6.2] - 2025-01-27

### Fixed
*   **🔖 Versioning:** Synchronized version numbers across all project files to v1.6.2.

## [v1.6.1] - Maintenance & Cleanup

### Fixed
*   **🧹 Cleanup:** Removed unused `uuid` dependency from `package.json` to reduce project footprint.

## [v1.0.4] - ROLLBACK (STABLE)

### Fixed
*   **🔄 Rollback:** Reverted entire application core to version 1.0.4 specifications.
*   **📦 Dependencies:** Downgraded Three.js to `0.160.0` to resolve incompatibility crashes with R3F v8.
*   **👷 Worker:** Simplified worker initialization logic to prevent "module specifier" errors in standard Vite environments.
*   **🛡️ Stability:** Removed experimental robustness handlers that were causing side effects on mobile devices.

## [v1.0.3] - Deployment Stability & i18n

### Fixed
*   **🚨 Critical Dependency Fix:** Downgraded `three` to **0.162.0** to resolve a strict peer dependency conflict with `@react-three/postprocessing`. This fixes the `ERESOLVE` error during deployment on strict package managers (like Vercel/EdgeOne).

### Changed
*   **🌏 i18n Polish:** Refined Simplified Chinese translations (`zh.ts`) for better clarity.
    *   "禁止屏幕休眠" -> "屏幕常亮" (Screen Always On).
    *   "自动隐藏 UI" -> "自动隐藏控制栏" (Auto-Hide Controls).
    *   "镜像翻转 (适合背投)" -> "镜像翻转" (Mirror Display).
*   **📦 Version Bump:** Application version updated to **1.0.3**.

## [v1.0.0] - Robustness and Alignment

### Added
*   **Audio Fingerprinting Overhaul:** Reworked `core/services/fingerprintService.ts` to accurately capture FFT data using a `ScriptProcessorNode` within an `OfflineAudioContext`, significantly improving local song matching.
*   **Changelog Update:** Documented all major changes for `v1.0.0` to provide a clear and concise history of project evolution.
*   **SEO & Analytics Restoration:** Re-added Google Search Console verification meta tag and Google Analytics (gtag.js) tracking code to `index.html` for better discoverability and traffic analysis.

### Changed
*   **Build System Alignment:** Removed `importmap` and CDN scripts from `index.html` to fully align with Vite's build process, ensuring compliance with OpenSpec.
*   **Web Worker Reliability:** Fixed `NebulaRenderer` in `core/workers/visualizer.worker.ts` to correctly use `OffscreenCanvas` in the worker context, preventing crashes in scenarios where `document` is unavailable.
*   **AI Policy Refinement:** Improved system instructions and response schemas in `core/services/geminiService.ts` for clearer linguistic adaptation (original script with parenthetical translations) and consistent branding ("Aura Vision AI Synesthesia Engine").
*   **Version Consistency:** Synchronized `APP_VERSION` in `core/constants/index.ts` and `README.md` to `1.0.0` to match `package.json`.
*   **Type System Cleanup:** Removed redundant `vite-env.d.ts` as `tsconfig.json` now correctly imports Vite client types, streamlining the TypeScript configuration.
*   **UX/UI Improvement:** Enhanced `SettingsToggle` component in `components/controls/ControlWidgets.tsx` to ensure consistent `w-full` application for header elements across variants.
