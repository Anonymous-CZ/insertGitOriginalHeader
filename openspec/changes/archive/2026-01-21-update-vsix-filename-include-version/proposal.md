# Change: 打包产物 VSIX 文件名包含版本号

## Why
当前工作流通过 `vsce package --out ./out/extension.vsix` 固定产物文件名，导致发布/下载时难以一眼区分版本，也不利于缓存与归档。

## What Changes
- 新增跨平台打包脚本：本地与 CI 均直接生成包含版本号的 VSIX 文件
- 更新 GitHub Actions 打包与 Release 流程：注入 tag 版本号并上传 `out/` 下版本化 VSIX
- 统一构件上传与 Release 附件的文件匹配路径，确保上传的是 `out/` 中的产物

## Decisions Needed
- 产物命名规则：建议使用 `git-original-author-header-${version}.vsix`（version 不含 `v` 前缀）

## Impact
- Affected specs: `open-source-release`
- Affected repo files (planned): `.github/workflows/package-vsix.yml`, `package.json`, `scripts/package-vsix.js`
- Runtime behavior: 无（仅 CI 打包产物命名/发布附件）
