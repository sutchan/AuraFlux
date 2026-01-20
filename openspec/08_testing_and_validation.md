# OpenSpec: 测试与验证规范

## 1. 测试策略
- **单元测试 (Unit Testing):** 针对核心服务 (如 `fingerprintService`, `beatDetector`) 和独立的工具函数编写测试用例，确保其逻辑的正确性。
- **集成测试 (Integration Testing):** 验证各模块间的协同工作能力，例如音频采集 (`useAudio`) -> AI 识别 (`useIdentification`) -> UI 展示 (`SongOverlay`) 的完整链路。
- **端到端 (E2E) 测试:** 模拟真实用户场景，覆盖从应用启动、授权、交互到关闭的全过程。
- **手动测试 (Manual Testing):** 在新版本发布前，由测试人员根据详细的测试用例对所有功能进行全面回归测试。

## 2. 测试报告
所有手动测试和专项测试的结果都将以 Markdown 报告的形式存档于 `openspec/reports/` 目录下。

### 最新报告
- **[功能测试报告 (v1.0.6)](./reports/test_report_20250127_1200.md)**
  - **摘要:** 全面验证了 v1.0.6 版本的核心功能，包括音频引擎、视觉渲染（2D Worker 和 3D WebGL）、AI 通感识别以及系统 UI。所有关键路径测试通过，项目达到发布标准。

---
*Aura Flux Testing & Validation - Version 1.5.1*