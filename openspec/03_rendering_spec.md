# OpenSpec: 渲染规范

## 1. 节拍检测算法 (True Beat Detection)
- **算法:** 谱通量 (Spectral Flux) 差分分析。
- **逻辑:** 输出 `isBeat` 布尔值，驱动视觉元素的瞬时爆发。

## 2. 2D 策略模式渲染器 (Worker-Compatible)
- **Digital Waveform (v3.0.0):** 
  - **动态增益:** 引入 `autoGainScale` 持续跟踪历史最大能级。
  - **天花板保护:** 振幅系数受 `applySoftCompression` 限制，确保波形不会因大音量而拍扁或超出视口。
- **Frequency Bars (v1.2.0):** 
  - **非线性映射:** 采用 $v^{0.8}$ 幂定律映射，提升中低音细节感，压制高音量瞬间的“触顶”现象。
- **Macro Bubbles (v2.1.0):** 引入 Sprite 缓存与软体物理模拟。

## 3. 3D WebGL 渲染 (v1.8.0 Global Update)
- **Neural Flow / Cube Field / Kinetic Wall:**
  - **动态峰值限制器 (Peak Limiter):** 所有 3D 场景的驱动特征（Bass/Mids/Treble）现在经过 `DynamicPeakLimiter` 处理。
  - **软膝盖压缩:** 在传递给着色器前，通过 $v^{0.7}$ 压缩曲线调整，确保在极高音量下 3D 位移依然保持线性动态。

---
*Aura Flux Rendering - Version 1.7.32*