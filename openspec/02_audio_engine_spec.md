# OpenSpec: 音频引擎规范

## 1. 信号流拓扑
- **双模输入:** 
  - `MICROPHONE`: 低延迟实时捕获。
  - `FILE`: 高保真本地解码，支持 ID3 元数据解析。
- **立体声处理:** 引入左右声道独立 AnalyserNode，支持立体声可视化特效（如 Ocean Wave, Silk Wave）。

## 2. 信号增强算法
- **智能疲劳补偿 (Fatigue System):** 在持续高分贝音频下自动增加 Headroom，防止视觉效果持续触顶。
- **自适应降噪:** 通过 `AdaptiveNoiseFilter` 动态学习底噪，提升弱信号下的可视化纯净度。
- **频谱标准化:** 根据 FFT Size 动态映射 Bass/Mids/Highs，确保视觉反馈在 512 与 4096 采样率下表现一致。

## 3. 存储与状态
- 使用 **IndexedDB** 存储用户导入的音轨，实现跨会话的播放列表持久化。

---
*Aura Flux Audio Engine - Version 1.8.62*