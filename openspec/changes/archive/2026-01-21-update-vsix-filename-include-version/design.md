# Design: VSIX 文件名包含版本号

## Goals
- GitHub Actions 打包产物（VSIX）文件名包含版本号，便于区分与归档
- GitHub Release 附件与 Actions artifact 的文件名一致且可预测

## Non-Goals
- 不改变扩展运行时逻辑
- 不改变 Marketplace 发布流程（仅影响仓库内的打包/Release 产物命名）

## Proposed Naming
- 产物文件名：`git-original-author-header-${version}.vsix`
  - `${version}` 来源：tag `vX.Y.Z` 去掉 `v` 前缀后的 `X.Y.Z`
  - 产物存放目录：`./out/`

## Approach
- 使用跨平台 Node 脚本作为 `pnpm run package-vsix` 实现，直接产出版本化 VSIX：
  - `./out/git-original-author-header-${version}.vsix`
- 工作流在执行 `pnpm run package-vsix` 时通过环境变量注入 tag 版本号：
  - `VSIX_VERSION=${version}`
- artifact 与 Release 上传使用 `out/*.vsix`

## Alternatives Considered
1. 在 `package.json` 中使用 shell 变量拼接版本号（例如 bash 的 `${VAR}`）
  - 优点：改动少
  - 缺点：跨平台脚本变量处理复杂（Windows/cmd 与 bash），可维护性较差
2. 移除 `--out`，使用 vsce 默认命名（通常包含版本号）
   - 优点：最少维护
   - 缺点：命名格式更依赖 vsce 默认行为，不够可控

## Acceptance Criteria
- 当 push tag `v1.2.3` 触发工作流时：
  - `out/` 下最终存在 `git-original-author-header-1.2.3.vsix`
  - GitHub Actions artifact 与 GitHub Release 附件均上传该文件
