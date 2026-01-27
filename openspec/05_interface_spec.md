# OpenSpec: UI/UX 与交互规范

## 1. 视觉层级 (Z-Index)
- **Z-0:** 核心渲染器 (Canvas/WebGL)。
- **Z-10:** 歌词覆盖层 (`LyricsOverlay`)。
- **Z-20:** 歌曲信息徽章 (`SongOverlay`)。
- **Z-100:** 自定义文字层 (`CustomTextOverlay`)。
- **Z-110:** 迷你控制条 (`MiniControls`)。
- **Z-120:** 扩展设置面板 (`Controls Panel`)。

## 2. 交互状态与闲置检测
- **Idle Timeout:** 3000ms。
- **Mini Bar 转换:** 闲置时透明度降低至 `0.12`。

## 3. 控制面板布局规范 (Panel Layouts)
- **UI 模式:** 切换 `Simple` (简洁) 和 `Advanced` (专业) 模式。
- **标签页顺序:** `Visual`, `Text`, `Audio`, `AI`, `System`。

## 4. 输入映射
### 键盘 (Desktop)
- `Space`: `toggleMicrophone`
- `R`: `randomizeSettings`
- `F`: `toggleFullscreen`
- `L`: `setShowLyrics`
- `H`: `toggleExpanded`

---
*Aura Flux Interface - Version 1.8.3*