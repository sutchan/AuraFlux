# OpenSpec: 音频引擎规范 (02)

## 1. 信号流拓扑
系统采用双模音频输入链路，支持立体声分离处理：
- **实时模式 (LIVE):** `MediaDevices.getUserMedia` -> `MediaStreamSource` -> `Splitter` -> `Dual Analysers`。
- **离线模式 (FILE):** `ArrayBuffer` -> `AudioContext.decodeAudioData` -> `BufferSource` -> `Analysers` -> `Destination`。

## 2. 信号处理算法
- **采样精度:** FFT Size 可在 512 至 2048 之间动态切换，默认平衡点为 1024。
- **立体声分离度:** 系统维护两个独立的 `AnalyserNode` (L/R)。
  - `Left Channel`: 驱动 2D/3D 效果的左半部及整体色相。
  - `Right Channel`: 驱动右半部对称性或次要形变参数。
- **自适应降噪 (Adaptive Noise Filter):** 实时学习环境底噪的频率分布，从频谱数组中动态减去噪声偏移量。
- **动态峰值限制器 (Dynamic Peak Limiter):** 自动追踪信号最大值并引入衰减因子，确保视觉能量始终保持在有效动态范围内。
- **软压缩 (Soft Compression):** 对提取出的特征值进行 `Math.pow(val, power)` 处理，增强低动态部分的视觉感知。

## 3. 媒体持久化与采集
- **IndexedDB (AuraFluxDB):** 使用 IndexedDB 存储音频原始 Blob 及其解析出的元数据（Title, Artist, AlbumArt）。
- **音频分片 (Audio Slicer):** 支持提取当前播放流的 15 秒 PCM 片段并转换为 WAV 格式，用于 AI 通感分析。
- **ID3 提取:** 集成 `jsmediatags` 实时提取文件元数据。

---
*Aura Flux Audio Engine Specification - Version 1.8.66*
*Author: Sut*