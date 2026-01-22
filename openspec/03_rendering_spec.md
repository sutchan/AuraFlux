# OpenSpec: 渲染规范

## 1. 节拍检测算法 (True Beat Detection)
- **算法:** 谱通量 (Spectral Flux) 差分分析。
- **逻辑:** 输出 `isBeat` 布尔值，驱动视觉元素的瞬时爆发。

## 2. 2D 策略模式渲染器 (Worker-Compatible)
- **Digital Waveform (v2.9.1):** 
  - **振幅系数:** 优化至 0.11（原 0.22），降低 50% 以获得更精致的示波效果。
  - **高频增益:** 保留高频段的自动增益补偿。
- **Frequency Bars (v1.0.8):**
  - **峰值下落 (Peak Decay):** 下落速率基数降低至 `h * 0.00125`（原 0.0025），悬浮感再次增强。
- **Macro Bubbles (v1.1.2 透明度优化):**
  - **极致通透 (Ethereal):** 
    - 中心 Alpha 降至 `0.002` (接近完全隐形)。
    - 边缘 Alpha 上限降至 `0.7` (原 0.98)，增强肥皂泡质感。
  - **鲁棒性:** 增加画布尺寸零值防御检查。
- **Deep Nebula (v1.8.1 鲁棒性增强):**
  - **鲁棒性:** 增加画布尺寸零值防御检查，防止在后台运行时发生渲染错误。
- **Plasma Flow:** 去除中心 white 点，采用主题色深度渐变。

## 3. 3D WebGL 渲染
- **Neural Flow (v3.2.4):** 安全 Curl Noise 引入 `+ 0.0001` 偏移。
- **Quantum Field (v1.6.14):** 
  - **亮度爆发:** 基础自发光提升至 0.4，高频响应系数提升至 4.0。
  - **材质:** 粗糙度降低至 0.1。
- **Crystal Core (v1.0.3):** 采用 `dispersion` (色散) 物理材质。

---
*Aura Flux Rendering - Version 1.6.80*