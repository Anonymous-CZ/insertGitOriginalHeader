# Change Log

All notable changes to the "insertGitOriginalHeader" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [1.0.2] - 2026-01-21

- 修复：文件发生重命名后仍能正确追溯最早作者/时间（`git log --follow`）。
- 修复：多工作区（multi-root）下 Git 命令的执行目录选择错误（基于 `workspace.getWorkspaceFolder`）。
- 修复：路径包含空格等字符时 Git 命令更稳定（改用 `execFile` 传参，避免 shell 拼接）。

## [0.0.6] - 2026-01-19

- `.vue` 文件使用 HTML 块注释风格插入文件头。

## [0.0.5] - 2026-01-18

- `@FilePath` 改为从项目根目录开始，且始终以 `/` 开头并使用 `/` 分隔符（例如 `/insertGitOriginalHeader/src/extension.ts`）。

## [0.0.4] - 2026-01-18

- 当文件未被 Git 跟踪或无 Git 历史时，`@Author` 回退为当前 Git 用户名（`git config user.name`）。

## [0.0.3] - 2026-01-18

- 根据文件类型选择注释风格（可通过设置覆盖）。

## [0.0.2] - 2026-01-18

- `@Date` 在“Git 最早提交时间”和“文件创建时间（birthtime）”中取更早的那个。
- 当 Git 时间不可用时回退到文件创建时间；两者都不可用时使用兜底值 `1970-01-01 00:00:00`。

## [0.0.1] - 2025-01-07

- 初始版本发布。
- 添加插入 Git 原始作者文件头功能。