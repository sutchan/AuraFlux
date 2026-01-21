# OpenSpec: 渲染规范

## 1. 节拍检测算法 (True Beat Detection) - v0.8.0
- **算法:** 谱通量 (Spectral Flux) 差分分析。
- **逻辑:** 输出 `isBeat` 布尔值，驱动视觉元素的瞬时爆发。

## 2. 2D 策略模式渲染器 (Worker-Compatible)
All 2D 渲染器实现 `IVisualizerRenderer` 接口。

- **Plasma Flow (v1.3.2 纯色优化):**
  - **视觉提升:** 彻底去除了径向渐变中心的纯白色点。改用主题色作为起始色阶。
- **Geometric Tunnel (v1.0.8 闭合优化):**
  - **修复:** 引入 `ctx.closePath()` 与 `lineJoin: round` 彻底解决多边形转角处的视觉缺口。
- **Digital Waveform (v2.5.0 Art Optimized):**
  - **风格:** 具备深度感与物理包络的艺术化多通道示波器。

## 3. 3D WebGL 渲染
- **Neural Flow (v1.3.2 动力学增强):**
  - **多频耦合:** 低音驱动宏观流场（Vector Field），中音驱动纤维聚集张力（Clumping），高音注入微观震颤（Neuro-jitter）。
  - **放电特效:** 节拍触发 `discharge` 白色脉冲，模拟神经元放电过程。
  - **生物荧光:** 粒子亮度随瞬时音量非线性增强，高音驱动随机电信号火花（Sparkle）。
- **Quantum Field (v1.6.3 随机翻滚优化):**
  - **随机动力学:** 每个方块实例分配独立的 3D 空间旋转轴（Rotation Axis）。
  - **复合速差:** 引入 `individualSpeedMult` 个体速度倍率，确保方阵内 2 倍翻滚速差。
- **SilkWaves (流光绸缎):** 材质 `emissiveIntensity` 随节拍闪烁。
- **Liquid Sphere (液态星球):** 顶点置换强度随低频能量非线性增强。

---
*Aura Flux Rendering - Version 1.6.43*