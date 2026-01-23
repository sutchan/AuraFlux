# OpenSpec: 渲染规范

## 1. 节拍检测算法 (True Beat Detection)
- **算法:** 谱通量 (Spectral Flux) 差分分析。
- **逻辑:** 输出 `isBeat` 布尔值，驱动视觉元素的瞬时爆发。

## 2. 2D 策略模式渲染器 (Worker-Compatible)
- **Digital Waveform (v2.9.1):** 振幅系数 0.11。
- **Frequency Bars (v1.0.8):** 峰值下落基数 `h * 0.00125`。
- **Macro Bubbles (v2.1.0):** 引入 Sprite 缓存与软体物理模拟，优化全屏初始填充逻辑。

## 3. 3D WebGL 渲染
- **Neural Flow (v2.0.0):** 神经元集群与突触脉冲模拟。
- **Kinetic Wall (v3.2.0 - v1.7.8 Update):** 
  - **全屏覆盖算法:** 基于窗口长宽比动态计算网格数量（Density * Max(Aspect, 1.0)）。
  - **机械量化:** 12级步进电机位移模拟。
  - **弹性阻尼:** 指数衰减的节拍涟漪。
  - **边界保护:** 摄像机 $Z$ 轴推进与 $X$ 轴平移限制，确保视口永不超出光墙边缘。
- **Quantum Field (v1.6.14):** 极速推进模式。

---
*Aura Flux Rendering - Version 1.7.8*