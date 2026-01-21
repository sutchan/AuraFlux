# OpenSpec: 渲染规范

## 1. 节拍检测算法 (True Beat Detection) - v0.8.0
- **算法:** 谱通量 (Spectral Flux) 差分分析。
- **逻辑:** 输出 `isBeat` 布尔值，驱动视觉元素的瞬时爆发。

## 2. 2D 策略模式渲染器 (Worker-Compatible)
All 2D 渲染器实现 `IVisualizerRenderer` 接口。

- **Plasma Flow (v1.3.2 纯色优化):**
  - **视觉提升:** 彻底去除了径向渐变中心的纯白色点。改用主题色作为起始色阶，并通过调整 Alpha 梯度确保中心深邃、边缘轻盈。这种处理方式消除了高频能量导致的“视觉刺眼”，使通感体验更加温润自然。
  - **动态:** 维持了 v1.3.1 的高灵敏度扩张算法。
- **Geometric Tunnel (v1.0.8 闭合优化):**
  - **修复:** 引入 `ctx.closePath()` 与 `lineJoin: round` 彻底解决多边形转角处的视觉缺口问题。
- **Digital Waveform (v2.5.0 Art Optimized):**
  - **风格:** 具备深度感与物理包络的艺术化多通道示波器。
- **Starfield (星际穿越):** 通过引力中心引导粒子。

## 3. 3D WebGL 渲染
- **SilkWaves (流光绸缎):** 材质 `emissiveIntensity` 随节拍闪烁。
- **Liquid Sphere (液态星球):** 顶点置换强度随低频能量非线性增强。
- **Quantum Field:** 航行速度相比初版提升 3 倍，强化穿越感。

---
*Aura Flux Rendering - Version 1.6.34*