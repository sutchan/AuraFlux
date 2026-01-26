# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.7.45] - 2025-03-05

### Features
*   **🧠 AI:** Expanded the available AI providers for music identification, adding **Claude 3**, **DeepSeek**, and **Qwen** to the existing options. Each new provider has a unique "persona" prompt, offering stylistically different analyses of the audio.
*   **🧠 AI:** Refined the system prompts for all AI providers (Gemini, OpenAI, Groq, etc.) to produce more distinct and stylistically appropriate responses, enhancing the "personality" of each selection.

## [v1.7.44] - 2025-03-05

### Fix
*   **🧠 AI:** Increased the AI identification request timeout from 15s to 25s. This provides the Gemini API with a more generous window to process complex audio analysis, significantly reducing the occurrence of `AI_TIMEOUT` errors and improving the reliability of the recognition feature.

## [v1.7.43] - 2025-03-05

### Refactor
*   **🧠 AI:** Overhauled the AI identification logic for significantly improved accuracy and reliability. The system prompt sent to Gemini is now much stricter, prioritizing precise commercial track identification and only falling back to creative descriptions if a match is impossible (explicitly setting `identified: false`).
*   **⚡️ Cache:** Massively improved the local acoustic fingerprinting algorithm. It now captures a "constellation" of peaks across multiple frequency bands instead of a single point, creating a far more robust and unique signature. This drastically increases the hit rate and accuracy of the local cache, reducing unnecessary API calls.

## [v1.7.42] - 2025-03-05

### Fix
*   **⚙️ Build:** Resolved the "Multiple instances of Three.js being imported" warning by configuring Vite to exclude all `importmap` packages (like `three`, `react-three/fiber`, etc.) from its dependency pre-bundling process. This ensures that both the dev server and the final build consistently rely on the single instance provided by the CDN via `importmap`, eliminating conflicts.

## [v1.7.41] - 2025-03-05

### Style
*   **🎨 Visuals:** Further tightened the brick spacing in "Kinetic Wall" mode for a near-seamless, high-density appearance.

## [v1.7.40] - 2025-03-05

### Style
*   **🎨 UI:** Enhanced the 3D text effect for a more pronounced, chiseled appearance.
*   **🎨 UI:** Reorganized the "Audio Reactive" and "3D Effect" toggles in the custom text panel into a side-by-side layout for improved clarity.

### Fix
*   **📄 License:** Replaced the incomplete `LICENSE` file with the full, standard Apache 2.0 license text.

## [v1.7.39] - 2025-03-05

### Style
*   **🎨 Visuals:** Fine-tuned the "Kinetic Wall" visualizer by reducing the spacing between bricks for a tighter, more cohesive and impactful wall effect.

## [v1.7.38] - 2025-03-05

### Refactor
*   **🎨 Visuals:** Reworked the "Kinetic Wall" visualizer for a smoother, more fluid aesthetic. Replaced the quantized, stepped motion with a continuous audio response and enabled bidirectional (push-pull) brick movement, eliminating perceived stuttering and creating a more organic, wave-like effect.

## [v1.7.37] - 2025-03-05

### Refactor
*   **🧠 AI:** Refined the AI identification service for improved accuracy, latency, and error handling. The system prompt now requests more descriptive mood analysis and canonical English keywords for robust styling. API request timeouts have been reduced, and specific error messages are now displayed for invalid API keys, significantly improving user feedback.

## [v1.7.36] - 2025-03-05

### Features
*   **🎨 Visuals:** Overhauled the "Deep Nebula" visualizer with a more colorful and dynamic engine. Gas clouds are now rendered with two-tone gradients based on the selected color theme, the background is a subtle radial gradient, and beat reactions are significantly more pronounced, creating a richer, more vibrant cosmic scene.

... (rest of the file unchanged)