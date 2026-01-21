# OpenSpec: 渲染规范

## 1. 节拍检测算法 (True Beat Detection) - v0.8.0
- **算法:** 谱通量 (Spectral Flux) 差分分析。
- **逻辑:** 输出 `isBeat` 布尔值，驱动视觉元素的瞬时爆发。

## 2. 2D 策略模式渲染器 (Worker-Compatible)
所有 2D 渲染器实现 `IVisualizerRenderer` 接口。

- **Digital Waveform (v2.5.0 Art Optimized):**
  - **风格:** 具备深度感与物理包络的艺术化多通道示波器。
  - **核心特性:** 
    - **包络调制:** 使用 `sin(x/w * PI)` 函数对振幅进行空间加权，使波形动态集中于屏幕中心，产生“汇聚能量流”的视觉效果。
    - **视差深度:** 针对 Sub-Bass 到 Air 不同频段，应用差异化的 X 轴偏移与 Z 轴缩放，模拟 3D 层叠感。
    - **自适应增益:** 自动追踪全局能量峰值，确保在不同输入环境（低音炮 vs 手机听筒）下线条始终灵动。
    - **瞬时相位抖动:** 节拍触发时相位累加步进瞬时激增，产生强烈的“被撞击”物理反馈。
- **PlasmaFlow (v1.3.0 Optimized):** 基于非线性流体场。
- **Starfield (星际穿越):** 通过引力中心引导粒子。

## 3. 3D WebGL 渲染
- **SilkWaves (流光绸缎):** 材质 `emissiveIntensity` 随节拍闪烁。
- **Liquid Sphere (液态星球):** 顶点置换强度随低频能量非线性增强。
- **Quantum Field:** 航行速度相比初版提升 3 倍，强化穿越感。

---
*Aura Flux Rendering - Version 1.6.29*