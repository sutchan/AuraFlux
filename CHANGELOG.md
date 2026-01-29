
# Changelog

All notable changes to the **Aura Flux** project will be documented in this file.

## [v1.8.10]

### UI/UX
*   **🎨 Playback:** Optimized the Library panel layout. Removed rigid height constraints on the main container and applied specific limits to the playlist card (max-h-420px), ensuring the right-side scrollbar appears correctly for long lists without stretching the entire UI.
*   **📝 Terminology:** Renamed the "Input" tab to "Audio" across all languages. This better reflects its role as a hub for both input selection (Mic/File) and audio analysis tuning (FFT/Smoothing).

### Fix
*   **🔊 Audio:** Fixed a critical audio feedback loop issue where the microphone input was inadvertently routed to the speakers when switching modes. The analyzer connection is now properly disconnected before switching sources.

## [v1.8.9]
...
