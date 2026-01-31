
# OpenSpec: AI 集成规范

## 1. 模型与工具配置
- **模型:** `gemini-3-flash-preview`。
- **工具:** `googleSearch`（用于实时验证歌曲元数据）。
- **参数精调:** 
  - `temperature: 0.7` (提升描述的丰富性与创造性)。
  - `topP: 0.95`, `topK: 40`。
  - `timeout: 25000ms` (从 15 秒增加以提升稳定性)。

## 2. 结构化输出 (Response Schema)
AI 必须返回严格的 JSON 格式。

### 歌曲识别 (Identification)
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

### AI 导演 (Auto-Director v1.8.0)
```typescript
{
  "mode": "string", // VisualizerMode Enum
  "colors": ["string", "string", "string"], // Hex Codes
  "speed": number,
  "sensitivity": number,
  "glow": boolean,
  "explanation": "string" // 设计理由
}
```

## 3. 提示词工程 (Prompt Engineering)
- **v1.7.37 Refactor:** 增强了提供商“人格”以获得更多样化的风格。
- **v1.8.0 Auto-Director:** 引入专门的 VJ/创意总监角色 Prompt，要求 AI 根据音频的 BPM、能量级和情感氛围，从可用的视觉引擎列表中选择最佳匹配，并设计三色调色板。

## 4. 语言与区域策略 (Linguistic Policy)
- **用户语言感知:** 根据 UI 语言设置动态注入目标语言上下文。
- **翻译规则:** `mood` 和 `lyricsSnippet` 必须翻译为目标语言。

## 5. 识别流程与降级
1. **本地指纹匹配:** 优先检查 `localStorage`。
2. **云端识别:** 发送 6秒 音频片段至 Gemini。
3. **健壮性解析 (v1.7.37):** 对 AI 返回的 JSON 字符串进行安全的 `try-catch` 解析。捕获特定的 API 错误（如无效密钥、超时）并返回一个用户友好的 `SongInfo` 对象供 UI 显示。
4. **Mock 模式:** 若 API Key 无效或未提供，返回模拟数据。

## 6. 控制逻辑 (v1.8.22)
- **AI Analysis (enableAnalysis):** 控制后台循环分析（情绪、流派、识别）。此开关位于“输入 (Audio)”面板。
- **Show Lyrics (showLyrics):** 控制前台 UI 覆盖层（歌词、曲目信息）的可见性。此开关位于“媒体库 (Library)”面板。
- **解耦设计:** 允许用户在不显示 UI 的情况下利用 AI 分析结果驱动视觉效果（如色彩、速度），或者仅显示本地 ID3 歌词而不调用 AI。

---
*Aura Flux AI Integration - Version 1.8.22*
