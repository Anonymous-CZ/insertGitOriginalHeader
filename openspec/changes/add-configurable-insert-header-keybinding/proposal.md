# Change: Add configurable keybindings for header commands

## Why
当前扩展支持右键菜单与命令面板操作文件头，但频繁操作时仍需要多步点击。增加快捷键可以明显提升日常效率。

同时用户对快捷键偏好不同，需确保默认快捷键可在 VS Code 中被覆盖和修改。

## What Changes
- 为 `git-original-author-header.insertGitOriginalHeader` 提供默认快捷键贡献（仅在可编辑文本编辑器中生效）
- 为 `git-original-author-header.updateHeaderLastEditMeta` 提供默认快捷键贡献（仅在可编辑文本编辑器中生效）
- 保持命令 ID 稳定，用户可通过 VS Code Keyboard Shortcuts / keybindings.json 覆盖默认快捷键
- 更新 README 与变更日志，说明两组默认快捷键与可更改方式

## Impact
- Affected specs:
  - `git-original-author-header`
- Affected code:
  - `package.json`
  - `README.md`
  - `CHANGELOG.md`
