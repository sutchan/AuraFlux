# OpenSpec: 测试与验证规范

## 1. 测试策略
- **单元测试 (Unit Testing):** 针对核心服务 (如 `fingerprintService`, `beatDetector`) 和独立的工具函数编写测试用例，确保其逻辑的正确性。
- **集成测试 (Integration Testing):** 验证各模块间的协同工作能力，例如音频采集 (`useAudio`) -> AI 识别 (`useIdentification`) -> UI 展示 (`SongOverlay`) 的完整链路。
- **端到端 (E2E) 测试:** 模拟真实用户场景，覆盖从应用启动、授权、交互到关闭的全过程。
- **手动测试 (Manual Testing):** 在新版本发布前，由测试人员根据详细的测试用例对所有功能进行全面回归测试。

## 2. 鲁棒性验证 (Robustness Tests) - v1.6.35
### A. 存储防御测试 (Storage Defense)
- **场景:** 模拟 LocalStorage 中存储了部分缺失或非法格式的 `settings` 对象（源自旧版本）。
- **预期:** `useVisualsState` 必须通过 `initialSettings` 自动补全缺失字段，确保渲染逻辑不产生 `undefined` 错误。

### B. 异常恢复测试 (Error Recovery)
- **场景:** 在“系统”设置面板中点击“Simulate Crash”按钮。
- **预期:** 
  1. `ErrorBoundary` 成功拦截错误并显示自定义 UI。
  2. 点击“Reload”能恢复应用。
  3. 点击“Factory Reset”能精准清除属于本应用的存储项并刷新。

### C. WebGL 上下文丢失测试
- **场景:** 使用 Chrome 开发者工具模拟 GPU 崩溃。
- **预期:** `ThreeVisualizer` 监听 `webglcontextlost` 事件并在控制台发出警告，并在 `webglcontextrestored` 后恢复渲染。

## 3. 测试报告存档
所有手动测试和专项测试的结果都将以 Markdown 报告的形式存档于 `openspec/reports/` 目录下。

---
*Aura Flux Testing & Validation - Version 1.6.35*