# OpenSpec: AI 集成规范

## 1. 模型与工具配置
- **模型:** `gemini-3-flash-preview`。
- **工具:** `googleSearch`（用于实时验证歌曲元数据）。
- **参数精调:** 
  - `temperature: 0.7` (提升描述的丰富性与创造性)。
  - `topP: 0.95`, `topK: 40`。
  - `timeout: 25000ms` (从 15 秒增加以提升稳定性)。

## 2. 结构化输出 (Response Schema)
AI 必须返回严格的 JSON 格式，Schema 更新以支持更丰富的描述和跨语言的鲁棒性：
```typescript
{
  "title": "string",
  "artist": "string",
  "lyricsSnippet": "string", // 关键歌词、主题或音频纹理描述 (已翻译)。
  "mood": "string", // 描述性美学总结 (3-5 词) (已翻译)。
  "mood_en_keywords": "string", // 用于样式的、逗号分隔的规范化英文关键词。
  "identified": "boolean"
}
```

## 3. 提示词工程 (Prompt Engineering)
- **v1.7.37 Refactor:** 增强了提供商“人格”以获得更多样化的风格。提示词现在明确要求更丰富的心境描述和用于样式的规范化英文关键词。对于纯音乐，会要求描述音频的“视觉纹理”。
- **v1.7.34 Refactor:** 引入“AI 人格”系统。根据用户在 UI 中选择的提供商（`GEMINI`, `GROQ`, `OPENAI`），动态调整系统提示词，以生成风格各异的描述性文本，增强用户体验。
- **Mood 指令:** 要求 AI 提供生动的 3-5 词总结，结合情感与流派。
- **Lyrics/Texture 指令:** 若无法识别具体歌词，要求描述音乐的视觉纹理、歌词主题或流派元素。

## 4. 语言与区域策略 (Linguistic Policy)
- **用户语言感知:** 根据 UI 语言设置动态注入目标语言上下文。
- **翻译规则:** `mood` 和 `lyricsSnippet` 必须翻译为目标语言。

## 5. 识别流程与降级
1. **本地指纹匹配:** 优先检查 `localStorage`。
2. **云端识别:** 发送 6秒 音频片段至 Gemini。
3. **健壮性解析 (v1.7.37):** 对 AI 返回的 JSON 字符串进行安全的 `try-catch` 解析。捕获特定的 API 错误（如无效密钥、超时）并返回一个用户友好的 `SongInfo` 对象供 UI 显示。
4. **Mock 模式:** 若 API Key 无效或未提供，返回模拟数据。

---
*Aura Flux AI Integration - Version 1.7.45*