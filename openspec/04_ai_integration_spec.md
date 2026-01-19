
# OpenSpec: AI 集成规范

## 1. 模型与工具配置
- **模型:** `gemini-3-flash-preview`。
- **工具:** `googleSearch`（用于实时验证歌曲元数据）。
- **参数精调:** 
  - `temperature: 0.15` (极低随机性)。
  - `topP: 0.8`, `topK: 20`。
  - `timeout: 20000ms` (硬性超时中断)。

## 2. 结构化输出 (Response Schema)
AI 必须返回严格的 JSON 格式：
```typescript
{
  "title": "string",
  "artist": "string",
  "lyricsSnippet": "string",
  "mood": "string",
  "identified": "boolean"
}
```

## 3. 语言与区域策略 (Linguistic Policy) - v1.0.5
为了提供最佳的本地化体验，System Instruction 必须包含以下逻辑：
- **用户语言感知:** 根据 UI 语言设置 (如 `zh`, `ja`, `es`) 动态注入目标语言上下文。
- **翻译规则:**
  - **Mood (情绪):** 必须翻译为目标语言 (例如 "Retro" -> "复古", "Energetic" -> "元気").
  - **Lyrics (歌词):** 选取最具代表性的片段并翻译。
  - **Title/Artist (标题/艺人):** 
    - 保持原文脚本 (如日语汉字/假名)。
    - **如果** 原文与用户语言不同，则在括号内提供翻译。
    - 例: `Lemon (柠檬)` / `米津玄師 (Kenshi Yonezu)`.

## 4. 识别流程与降级
1. **本地指纹匹配:** 优先检查 `localStorage` 中的声学特征库。
2. **云端识别:** 发送 6秒 音频片段至 Gemini。
3. **Mock 模式:** 若配置为 `MOCK` 提供商或 API Key 无效，返回模拟数据以供演示。

---
*Aura Flux AI Integration - Version 0.8.0*
