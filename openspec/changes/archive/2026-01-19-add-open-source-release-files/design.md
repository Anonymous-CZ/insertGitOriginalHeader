# Design: Open-source and release-readiness files

## Goals
- 为正式版发布补齐最小但完整的开源合规与协作文件集
- 明确许可证、贡献方式、安全报告渠道、支持与发布流程

## Non-Goals
- 不改变扩展运行时逻辑
- 不引入新的网络服务或账号体系

## File Set (Planned)
- `LICENSE`: 根目录放置完整许可文本（OSI-approved）
- `package.json#license`: 使用 SPDX 标识符，与 LICENSE 一致
- `CONTRIBUTING.md`: 贡献指南（开发/测试/打包命令、提交要求）
- `CODE_OF_CONDUCT.md`: 行为准则（建议采用有明确授权的模板）
- `SECURITY.md`: 漏洞报告与处理流程
- `SUPPORT.md`: 支持渠道与期望
- `RELEASING.md`（或 `docs/releasing.md`）: 发布流程与检查清单

## Notes
- 许可证文本与部分模板文档通常自带授权条款；实现时应选择可合法复用的模板并保留其要求的归属/许可声明。
- 当前 `package.json` 中 `description` 存在乱码/不完整字符串，正式发布前建议同步修正（不在本变更核心范围，但可作为附带清理项）。
