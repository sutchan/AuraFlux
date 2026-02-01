# OpenSpec: AI 智能与语义规范 (04)

## 1. AI 驱动核心
系统深度集成 **Google Gemini 3 Flash** 与 **Gemini 2.5 Flash Image**，构建完整的“通感转译”链路。

## 2. 核心功能链路
- **AI 通感分析 (Song Identification):** 
  - 提取 15s 音频片段，识别曲目、风格与情绪。
  - 协议包含：`title`, `artist`, `lyrics`, `mood_en_keywords`, `identified`。
- **AI 视觉导演 (Visual Director):** 
  - 根据音频特征自动选择最优视觉模式、配色方案（Hex Array）及运动速度。
- **AI 灵感背景 (Imagen Background):** 
  - 基于识别到的 `mood_en_keywords` 调用 Gemini 2.5 Flash Image 生成 16:9 的艺术背景图。
  - 支持模糊度 (Blur) 与透明度 (Opacity) 实时调节。

## 3. 数据安全与隐私
- **边缘计算优先:** 所有的频谱处理与特征提取在客户端完成。
- **密钥管理 (BYOK):** 支持用户输入自己的 API Key，通过 `validateApiKey` 进行握手验证，加密存储于 LocalStorage。
- **容错处理:** 在 API 不可用或配额用尽时，自动回退到本地模拟模式 (MOCK) 或 ID3 标签提取。

---
*Aura Flux AI Integration Specification - Version 1.8.66*
*Author: Sut*