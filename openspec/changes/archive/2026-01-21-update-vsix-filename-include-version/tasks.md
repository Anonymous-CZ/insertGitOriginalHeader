# Tasks: VSIX 文件名包含版本号

## 1. Proposal Finalization
- [x] 确认产物命名规则（默认提议：`git-original-author-header-${version}.vsix`）
- [x] 确认版本号来源（tag `vX.Y.Z` → `X.Y.Z`）

## 2. Workflow Update
- [x] 更新 `.github/workflows/package-vsix.yml`：通过 `VSIX_VERSION` 注入 tag 版本号并打包
- [x] 更新 `.github/workflows/package-vsix.yml`：artifact 上传路径改为 `out/*.vsix`
- [x] 更新 `.github/workflows/package-vsix.yml`：Release 附件上传路径改为 `out/*.vsix`

## 2.1 Cross-platform Script
- [x] 新增跨平台脚本：`scripts/package-vsix.js`（直接生成 `out/git-original-author-header-${version}.vsix`）
- [x] 更新 `package.json#scripts.package-vsix`：改为调用跨平台脚本
- [x] 更新 `.github/workflows/package-vsix.yml`：通过 `VSIX_VERSION` 注入 tag 版本号

## 3. Validation
- [x] 运行 `openspec validate update-vsix-filename-include-version --strict --no-interactive`
- [ ] 本地（可选）验证：执行 `pnpm run package-vsix` 并确认 `out/` 产物可被工作流 glob 匹配
