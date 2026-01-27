# OpenSpec: 音频引擎规范

## 1. 采集规范
- **采样源:** 
  - `MICROPHONE`: `navigator.mediaDevices.getUserMedia`
  - `FILE`: 本地文件解码 (`AudioContext.decodeAudioData`)
- **约束配置:** 
  ```json
  {
    "echoCancellation": false,
    "noiseSuppression": false,
    "autoGainControl": false
  }
  ```
- **格式兼容性 (MIME Types):**
  - 优先: `audio/webm;codecs=opus` (Chrome/Firefox)
  - 回退: `audio/mp4` (iOS Safari 17+), `audio/aac`。
  - *策略：* 运行时动态检测 `MediaRecorder.isTypeSupported` 以选择最佳格式。

## 2. 路由拓扑 (Routing Topology)
- **麦克风模式:** `Source (Mic) -> AnalyserNode (FFT)` (无输出，防回授)
- **文件模式 (v1.8.0):** `AudioBufferSourceNode -> AnalyserNode (FFT) -> Destination (Speakers)`
- **内录模式 (Studio):** `AnalyserNode -> MediaStreamDestination`，确保录制纯净音频。
- **生命周期管理:** 
  - 监听 `visibilitychange` 事件。当页面重新获得焦点时，强制调用 `AudioContext.resume()` 以修复 iOS 设备上的静音问题。

## 3. 频谱分析 (Real-time FFT)
- **FFT Size:** 默认 512 (UI 可调至 4096)。
- **Smoothing:** 默认 0.8。
- **数据流:** Uint8Array 频域数据每帧通过 `postMessage` 发送至 Web Worker 驱动视觉效果。

## 4. 声学指纹与切片 (Acoustic Analysis) - v1.8.0 Refactor
- **核心技术:** `OfflineAudioContext`。
- **实时指纹:** 使用 `ScriptProcessorNode` 提取星座特征（Constellation Map）。
- **智能切片 (v1.8.0):** 在 AI 导演模式下，使用 `OfflineAudioContext` 快速渲染音频文件的 15 秒精华片段，转换为 WAV Blob 发送给 Gemini 进行深度分析。

---
*Aura Flux Audio Engine - Version 1.8.0*