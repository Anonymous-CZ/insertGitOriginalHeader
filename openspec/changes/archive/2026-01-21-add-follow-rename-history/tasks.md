## 1. Implementation
- [x] 将获取最早提交信息的 git 命令改为跟随重命名（使用 `git log --follow ... -- <path>`）
- [x] 确保路径规范化与引号转义在 Windows/macOS/Linux 上都稳定可用（实现改为 `execFile` + args 以避免 shell 转义问题）
- [x] 保持未跟踪文件/无历史文件的兜底行为不变（继续返回空值并由上层 pickAuthor 兜底）

## 2. Tests
- [x] 为 git 命令构造逻辑补充单测（至少覆盖：普通路径、Windows 反斜杠路径、包含空格路径）
- [x] 增加一个“重命名后仍能取到原始作者”的集成测试（在临时 git 仓库中创建文件→提交→重命名→再提交→验证作者为最早提交作者）

## 3. Docs
- [x] 更新 capability spec delta（本变更已提供）并确保 `openspec validate --strict` 通过
