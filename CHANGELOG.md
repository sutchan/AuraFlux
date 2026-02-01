
# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.8.62] - 2025-07-18

### 🐛 Bug Fixes
*   **Localization Completeness:** Fixed untranslated `visualPanel` keys in Japanese, Spanish, Korean, German, and French locale files, ensuring consistent UI text across all supported languages.
*   **Worker Path Resolution:** Explicitly converted the `VisualizerWorker` import in `VisualizerCanvas.tsx` to use a relative path (`../../core/workers/...`) instead of a path alias (`@/`). This resolves the `Failed to resolve module specifier` error encountered in browser environments where build-time aliases were not correctly applied to worker instantiation.
*   **Entry Point Paths:** Updated `index.tsx` to use relative imports for `App` and `ErrorBoundary` components, ensuring robust module loading across all development and preview modes.

### 🧹 Housekeeping
*   **Version Synchronization:** Updated version numbers across all project documentation to `1.8.62`.

## [v1.8.61] - 2025-07-18

### 🐛 Bug Fixes
*   **Localization Syntax Error:** Fixed a critical `Uncaught SyntaxError` caused by truncated Russian (`ru.ts`) and Arabic (`ar.ts`) locale files. Restored the full, syntactically correct content for both files, resolving the application's failure to load.

### 🧹 Housekeeping
*   **Version Synchronization:** Updated version numbers across all project documentation to `1.8.61`.

## [v1.8.60] - 2025-07-18

### 🐛 Bug Fixes
*   **Module Path Resolution:** Fixed a critical "Failed to resolve module specifier" error by changing the CSS import in `index.tsx` from a path alias (`@/`) to a relative path (`./`). This ensures compatibility with browser-based preview environments that do not fully resolve aliases for non-JS/TS module imports.

### 🧹 Housekeeping
*   **Version Synchronization:** Updated version numbers across all project documentation and specification files to `1.8.60` to maintain consistency.

## [v1.8.58] - 2025-07-17
...
