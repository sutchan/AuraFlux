# OpenSpec: 音频引擎规范

## 1. 采集规范
- **采样源:** `navigator.mediaDevices.getUserMedia`
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
- **实时链路:** `Source -> AnalyserNode (FFT) -> Destination`
- **生命周期管理:** 
  - 监听 `visibilitychange` 事件。当页面重新获得焦点时，强制调用 `AudioContext.resume()` 以修复 iOS 设备上的静音问题。

## 3. 频谱分析 (Real-time FFT)
- **FFT Size:** 默认 512 (UI 可调至 4096)。
- **Smoothing:** 默认 0.8。
- **数据流:** Uint8Array 频域数据每帧通过 `postMessage` 发送至 Web Worker 驱动视觉效果。

## 4. 声学指纹 (Acoustic Fingerprinting) - v1.0.0 Refactor
- **核心技术:** `OfflineAudioContext` + `ScriptProcessorNode`。
- **流程:**
  1. **解码:** 将 Base64 音频解码为 AudioBuffer。
  2. **离线渲染:** 创建与原音频采样率一致的 `OfflineAudioContext`。
  3. **特征提取:** 在 `ScriptProcessor.onaudioprocess` 回调中实时截获 FFT 数据。
  4. **特征降维:** 扫描 0-4300Hz 频段的能量峰值索引。
  5. **匹配:** Jaccard 相似度算法对比本地缓存。

---
*Aura Flux Audio Engine - Version 1.7.23*