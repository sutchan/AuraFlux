# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.8.8]

### Refactor
*   **🧠 AI:** Enhanced robustness of the JSON response parser in `aiService`. It now uses a case-insensitive regex to strip Markdown code blocks (e.g., ` ```JSON ` vs ` ```json `), reducing parsing errors from unpredictable LLM outputs.
*   **🌍 i18n:** Performed a full integrity audit of all 10 language packs. Confirmed that recent additions like `studioPanel` recording options and `aiPanel` status messages are correctly translated and present in all locales (EN, ZH, TW, JA, ES, KO, DE, FR, RU, AR).

### Documentation
*   **📚 OpenSpec:** Synchronized all specification documents to v1.8.8, updating the Testing & Validation spec to include i18n integrity checks.

## [v1.8.6]

### Fix
*   **🎥 Studio:** Fixed an issue where non-English characters (Chinese, Japanese, etc.) in song titles were stripped from recorded video filenames. The filename generation logic now correctly supports Unicode while sanitizing only system-reserved characters.
*   **🎥 Studio:** Resolved a UI flickering/layout jump issue in the recording preview modal caused by frequent re-renders during audio playback.

### Refactor
*   **🌍 i18n:** Conducted a comprehensive audit of all language files (10 languages) to ensure full coverage of recent features, including Studio Panel recording options and audio error messages.
*   **📚 Specs:** Updated OpenSpec documentation to include file naming conventions and architecture versioning.

## [v1.8.5]

### Refactor
*   **🌍 i18n:** Completed internationalization coverage for all 10 supported languages (EN, ZH, TW, JA, ES, KO, DE, FR, RU, AR). Added missing translation keys for player controls (`unknownTrack`) and audio error messages.
*   **🔊 Audio:** Enhanced robustness of the audio engine error handling. Microphone permission errors and device failures now display localized, user-friendly messages instead of generic English alerts.
*   **🎵 Player:** Polished the internal file player UI to correctly handle missing metadata states with localized fallbacks.

### Fix
*   **🛠️ Architecture:** Formalized the `jsmediatags` integration strategy in documentation. The library is now loaded via a global script tag (CDN) to bypass module resolution conflicts with `esm.sh`, ensuring stable ID3 tag reading without build errors.

## [v1.8.4]

### Features
*   **🎵 Media:** Implemented ID3 metadata extraction for local audio files. The app now displays Song Title, Artist, and Album Art when playing user-uploaded tracks.
*   **🎥 Studio:** Enhanced the Recording Studio panel to display the currently loaded track name, ensuring users know exactly what metadata will be used for filenames.
*   **🌍 i18n:** Updated all 10 language packs to support new UI elements, including "ID3 Tag" source labels and localized video format descriptions (e.g., VP9 High Quality, Social MP4) for Traditional Chinese, Japanese, Korean, Spanish, and German.

### Fix
*   **🛠️ Build:** Added `jsmediatags` to Vite's external configuration to correctly leverage the CDN importmap and prevent bundling issues.

## [v1.8.3]

### Refactor
*   **🎨 Visuals:** Implemented strict aesthetic constraints for `Auto-Rotate` and `Randomize` features. Specific modes (Spectrum, Tunnel, Resonance, etc.) now automatically disable **Glow** and/or **Trails** to prevent visual clutter and improve clarity.
*   **🛠️ Robustness:** Removed the "Simulate Crash" debug feature and its associated UI controls from the production build to ensure stability and prevent accidental triggering.
*   **🧹 Cleanup:** Purged unused localization strings (`simulateCrash`) from all language files to reduce bundle size.

### Documentation
*   **📚 OpenSpec:** Synchronized all architecture and testing specifications to version 1.8.3.

## [v1.7.46]

### Features
*   **🌍 i18n:** Completed localization for all UI strings across all 10 supported languages, including new AI provider names and status messages, ensuring a fully translated experience for global users.
*   **🛠️ Robustness:** Added a "Simulate Crash" button in the advanced System panel. This allows for manual testing of the application's `ErrorBoundary` component, verifying the crash recovery screen as specified in the testing validation spec.

### Fix
*   **🎨 UI:** Refactored the AI Settings Panel to use the new i18n keys for AI provider names and messages, removing all hardcoded strings.

## [v1.7.45]

### Features
*   **🧠 AI:** Expanded the available AI providers for music identification, adding **Claude 3**, **DeepSeek**, and **Qwen** to the existing options. Each new provider has a unique "persona" prompt, offering stylistically different analyses of the audio.
*   **🧠 AI:** Refined the system prompts for all AI providers (Gemini, OpenAI, Groq, etc.) to produce more distinct and stylistically appropriate responses, enhancing the "personality" of each selection.

## [v1.7.44]

### Fix
*   **🧠 AI:** Increased the AI identification request timeout from 15s to 25s. This provides the Gemini API with a more generous window to process complex audio analysis, significantly reducing the occurrence of `AI_TIMEOUT` errors and improving the reliability of the recognition feature.

## [v1.7.43]

### Refactor
*   **🧠 AI:** Overhauled the AI identification logic for significantly improved accuracy and reliability. The system prompt sent to Gemini is now much stricter, prioritizing precise commercial track identification and only falling back to creative descriptions if a match is impossible (explicitly setting `identified: false`).
*   **⚡️ Cache:** Massively improved the local acoustic fingerprinting algorithm. It now captures a "constellation" of peaks across multiple frequency bands instead of a single point, creating a far more robust and unique signature. This drastically increases the hit rate and accuracy of the local cache, reducing unnecessary API calls.

## [v1.7.42]

### Fix
*   **⚙️ Build:** Resolved the "Multiple instances of Three.js being imported" warning by configuring Vite to exclude all `importmap` packages (like `three`, `react-three/fiber`, etc.) from its dependency pre-bundling process. This ensures that both the dev server and the final build consistently rely on the single instance provided by the CDN via `importmap`, eliminating conflicts.

## [v1.7.41]

### Style
*   **🎨 Visuals:** Further tightened the brick spacing in "Kinetic Wall" mode for a near-seamless, high-density appearance.

## [v1.7.40]

### Style
*   **🎨 UI:** Enhanced the 3D text effect for a more pronounced, chiseled appearance.
*   **🎨 UI:** Reorganized the "Audio Reactive" and "3D Effect" toggles in the custom text panel into a side-by-side layout for improved clarity.

### Fix
*   **📄 License:** Replaced the incomplete `LICENSE` file with the full, standard Apache 2.0 license text.

## [v1.7.39]

### Style
*   **🎨 Visuals:** Fine-tuned the "Kinetic Wall" visualizer by reducing the spacing between bricks for a tighter, more cohesive and impactful wall effect.

## [v1.7.38]

### Refactor
*   **🎨 Visuals:** Reworked the "Kinetic Wall" visualizer for a smoother, more fluid aesthetic. Replaced the quantized, stepped motion with a continuous audio response and enabled bidirectional (push-pull) brick movement, eliminating perceived stuttering and creating a more organic, wave-like effect.

## [v1.7.37]

### Refactor
*   **🧠 AI:** Refined the AI identification service for improved accuracy, latency, and error handling. The system prompt now requests more descriptive mood analysis and canonical English keywords for robust styling. API request timeouts have been reduced, and specific error messages are now displayed for invalid API keys, significantly improving user feedback.

## [v.1.7.36]

### Features
*   **🎨 Visuals:** Overhauled the "Deep Nebula" visualizer with a more colorful and dynamic engine. Gas clouds are now rendered with two-tone gradients based on the selected color theme, the background is a subtle radial gradient, and beat reactions are significantly more pronounced, creating a richer, more vibrant cosmic scene.