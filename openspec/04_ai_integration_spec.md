# OpenSpec: AI 集成规范

## 1. 智能服务矩阵
- **Gemini 3 Flash:**
  - **实时识别:** 4秒片段识别、情绪提取、歌词同步。
  - **AI 导演:** 分析音频 BPM 和能量，自动切换渲染引擎和色彩主题。
- **Gemini 2.5 Flash Image:**
  - **灵感背景:** 根据歌曲情绪关键词生成高保真 16:9 艺术壁纸。

## 2. 通信架构
- **Structured Output:** 强一致性 JSON 响应，基于 `responseSchema` 保证字段稳定性。
- **隐私保护:** 密钥 Base64 混淆存储，所有音频处理在边缘完成，仅发送特征片段至 AI。

---
*Aura Flux AI Integration - Version 1.8.62*