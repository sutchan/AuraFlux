# OpenSpec: 渲染规范

## 1. 核心引擎分类
- **WebGL 3D (High Fidelity):** 
  - 架构: 基于 React Three Fiber 与 Three.js。
  - 重点模式: Resonance Orb, Kinetic Wall, Ocean Wave, Silk Wave。
- **Offscreen 2D (Optimized):**
  - 架构: 使用 OffscreenCanvas API 与 Web Workers 实现主线程零阻塞绘图。
  - 经典模式: Nebula, Plasma, Lasers, Digital Waveform, Ripples。

## 2. 性能与精度
- **动态 DPR:** 根据 `quality` 设置自动调节 (0.8x 至 1.5x)。
- **数值保护:** 渲染循环内置 Epsilon 检查，防止纹理坐标越界导致的黑屏。

## 3. 视觉导演 (Beat Sync)
- **节拍检测:** 使用频谱通量算法，驱动全局 Bloom、相机抖动及物理参数瞬时爆发。
- **背景增强:** 支持 Imagen 驱动的 AI 艺术图层与专辑封面模糊图层。

---
*Aura Flux Rendering - Version 1.8.62*