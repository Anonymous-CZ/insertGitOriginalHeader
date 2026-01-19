# Tasks: Add open-source license and release-readiness files

## 1. Proposal Finalization
- [x] 确认许可证选择为 `MIT`（SPDX：`MIT`）
- [x] 确认发布说明文件位置为根目录 `RELEASING.md`

## 2. Repository Files
- [x] 新增 `LICENSE`（与所选许可证一致）
- [x] `package.json` 增加/更新 `license` 字段（SPDX），并与 `LICENSE` 一致
- [x] 新增 `CONTRIBUTING.md`：贡献方式、开发/测试/打包命令、提交规范（如有）
- [x] 新增 `CODE_OF_CONDUCT.md`：社区行为准则（建议使用有明确授权的模板）
- [x] 新增 `SECURITY.md`：安全漏洞报告渠道、期望响应时间、版本支持策略
- [x] 新增 `SUPPORT.md`：问题反馈渠道（issues）、FAQ/已知限制、响应预期
- [x] 新增发布说明：`RELEASING.md`（或 `docs/releasing.md`）包含版本号变更、`vsce package`/发布步骤、验证清单

## 3. Documentation Updates
- [x] 更新 `README.md` 的“许可证”章节：说明许可证并链接到 `LICENSE`
- [x] 在 `README.md` 中补充链接：贡献指南/行为准则/安全/支持/发布说明

## 4. Validation
- [x] 运行 `openspec validate add-open-source-release-files --strict --no-interactive`
- [x] 运行 `pnpm run lint`
- [x] 运行 `pnpm test`
