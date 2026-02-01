# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.8.66] - 2025-07-18

### 🚀 Features & Refinements
*   **Full Specification Sync:** Synchronized all code features (Hybrid Rendering, Studio recording, AI Synergy) into the `openspec/` documentation system.
*   **Version Update:** Updated application version to `v1.8.66` across all manifests and documentation.
*   **Metadata Polish:** Enhanced `metadata.json` with versioning information.

### 🧹 Housekeeping
*   **Documentation Audit:** Verified that `01_architecture` through `09_marketing` accurately reflect the current technical state of the application.

## [v1.8.62] - 2025-07-18

### 🐛 Bug Fixes
*   **Localization Completeness:** Fixed untranslated `visualPanel` keys in Japanese, Spanish, Korean, German, and French locale files, ensuring consistent UI text across all supported languages.
*   **Worker Path Resolution:** Explicitly converted the `VisualizerWorker` import in `VisualizerCanvas.tsx` to use a relative path (`../../core/workers/...`) instead of a path alias (`@/`). This resolves the `Failed to resolve module specifier` error encountered in browser environments where build-time aliases were not correctly applied to worker instantiation.
*   **Entry Point Paths:** Updated `index.tsx` to use relative imports for `App` and `ErrorBoundary` components, ensuring robust module loading across all development and preview modes.

### 🧹 Housekeeping
*   **Version Synchronization:** Updated version numbers across all project documentation to `1.8.62`.

## [v1.8.61] - 2025-07-18
...