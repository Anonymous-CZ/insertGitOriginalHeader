# Change: Add open-source license and release-readiness files

## Why
当前仓库即将准备发布正式版，但缺少开源发布所需的关键仓库文件（例如 LICENSE / SECURITY / CONTRIBUTING 等），会降低用户信任、增加合规风险，并影响在 VS Code Marketplace 等渠道的发布体验。

## What Changes
- 添加开源许可与相关说明文件：`LICENSE`（根目录）
- 添加协作与治理相关文件：`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`SUPPORT.md`
- 添加发布说明文件：`RELEASING.md`（或 `docs/releasing.md`，二选一并统一到 README）
- 更新 `README.md`：补齐“许可证”章节，并链接到上述文件
- 更新 `package.json`：补齐 `license` 字段（SPDX 标识符）并与 `LICENSE` 保持一致

## Decisions Needed
- 许可证类型：已确认使用 `MIT`
- 发布说明文件位置：已确认使用根目录 `RELEASING.md`

## Impact
- Affected specs: `open-source-release`
- Affected repo files (planned): `LICENSE`, `package.json`, `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `RELEASING.md`
- Runtime behavior: 无（仅仓库元数据/文档与发布合规）
