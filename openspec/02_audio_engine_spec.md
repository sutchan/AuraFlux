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
- **数据流:** Uint8Array 频域数据每帧发送至渲染线程。

## 4. 采样标准化 (v1.8.25 Standard)
- **索引映射原则**: 严禁在渲染逻辑中使用硬编码的数组索引（如 `data[10]`）。
- **归一化算法**: 必须根据 `analyser.frequencyBinCount` 动态计算偏移。
  - 低音 (Bass): `[0, length * 0.06]`
  - 中音 (Mids): `[length * 0.1, length * 0.3]`
  - 高音 (Highs): `[length * 0.4, length * 0.8]`
- **目的**: 确保用户切换 FFT Size (512 -> 4096) 时，视觉反馈的频谱分布保持一致。

---
*Aura Flux Audio Engine - Version 1.8.25*