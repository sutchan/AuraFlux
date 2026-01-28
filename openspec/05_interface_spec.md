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

## 5. 文件与导出规范 (v1.8.6)
- **录制文件名生成:**
  - 自动将歌曲元数据 (Title/Artist) 嵌入文件名。
  - **Unicode 支持:** 完整支持中文、日文等非 ASCII 字符。
  - **清洗规则:** 仅移除操作系统保留字符 (`< > : " / \ | ? *`)，其余字符保留，以确保文件名的可读性和兼容性。

---
*Aura Flux Interface - Version 1.8.8*