
# Aura Flux - OpenSpec 规范主文档

本项目严格遵循 **OpenSpec** 标准进行架构设计与文档编写。Aura Flux 是一项融合了高性能实时频谱分析与 Google Gemini 3 系列生成式 AI 的沉浸式视听交互实验。

## 核心规范体系 (Current Standard)

以下文档位于 `openspec/` 目录下，代表了本项目的最新技术标准：

1.  **[01 架构与设计规范](./01_architecture_spec.md)**
    *   恢复 Importmap + CDN 策略，在 Vite 中将外部库标记为 external (v1.5.0)。
2.  **[02 音频引擎与信号规范](./02_audio_engine_spec.md)**
    *   OfflineAudioContext 指纹提取算法、iOS Safari MIME 兼容性 (v0.8.0)。
3.  **[03 视觉生成渲染规范](./03_rendering_spec.md)**
    *   2D 策略模式渲染器、3D WebGL 顶点位移算法。
4.  **[04 AI 智能与语义规范](./04_ai_integration_spec.md)**
    *   Gemini 3 模型配置、语言自适应策略 (Linguistic Policy) (v0.8.0)。
5.  **[05 UI/UX 与交互规范](./05_interface_spec.md)**
    *   状态转换逻辑、面板布局系统、闲置隐藏策略。
6.  **[06 持久化与国际化规范](./06_storage_and_i18n_spec.md)**
    *   LocalStorage Schema、多语言字典结构 (v1.0.4)。
7.  **[07 部署与环境规范](./07_deployment_guide.md)**
    *   更新为 CDN 混合构建策略说明 (v1.5.0)。
8.  **[08 测试与验证](./08_testing_and_validation.md)**
    *   链接至最新的功能测试报告：**[功能测试报告 (v1.0.6)](./reports/test_report_20250127_1200.md)**

---
*Aura Flux Project Specification - Version 1.6.1*
