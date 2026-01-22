# OpenSpec: AI 集成规范

## 1. 模型与工具配置
- **模型:** `gemini-3-flash-preview`。
- **工具:** `googleSearch`（用于实时验证歌曲元数据）。
- **参数精调:** 
  - `temperature: 0.7` (提升描述的丰富性与创造性)。
  - `topP: 0.95`, `topK: 20`。
  - `timeout: 30000ms`。

## 2. 结构化输出 (Response Schema)
AI 必须返回严格的 JSON 格式，Schema 更新以支持更丰富的描述：
```typescript
{
  "title": "string",
  "artist": "string",
  "lyricsSnippet": "string", // 包含歌词摘录或听觉/流派纹理描述
  "mood": "string", // 包含 3-5 个词的审美总结，融合流派提示
  "identified": "boolean"
}
```

## 3. 提示词工程 (Prompt Engineering)
- **Mood 指令:** 要求 AI 提供生动的 3-5 词总结，结合情感与流派（如 "Melancholic Cyberpunk Rain" 而非仅 "Sad"）。
- **Lyrics/Texture 指令:** 若无法识别具体歌词，要求描述音乐的视觉纹理、歌词主题或流派元素。

## 4. 语言与区域策略 (Linguistic Policy)
- **用户语言感知:** 根据 UI 语言设置动态注入目标语言上下文。
- **翻译规则:** 情绪、歌词必须翻译为目标语言。

## 5. 识别流程与降级
1. **本地指纹匹配:** 优先检查 `localStorage`。
2. **云端识别:** 发送 6秒 音频片段至 Gemini。
3. **Mock 模式:** 若 API Key 无效，返回模拟数据。

---
*Aura Flux AI Integration - Version 1.6.84*