# OpenSpec: AI 集成规范

## 1. 模型与工具配置
- **模型:** `gemini-3-flash-preview`。
- **工具:** `googleSearch`（用于实时验证歌曲元数据）。
- **参数精调:** 
  - `temperature: 0.15` (极低随机性)。
  - `topP: 0.8`, `topK: 20`。
  - `timeout: 30000ms`。

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

## 3. 语言与区域策略 (Linguistic Policy)
- **用户语言感知:** 根据 UI 语言设置动态注入目标语言上下文。
- **翻译规则:** 情绪、歌词必须翻译为目标语言。

## 4. 识别流程与降级
1. **本地指纹匹配:** 优先检查 `localStorage`。
2. **云端识别:** 发送 6秒 音频片段至 Gemini。
3. **Mock 模式:** 若 API Key 无效，返回模拟数据。

---
*Aura Flux AI Integration - Version 1.6.74*