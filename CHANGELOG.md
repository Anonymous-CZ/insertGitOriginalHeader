# Change Log

All notable changes to the "insertGitOriginalHeader" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- 按文件类型选择注释风格插入文件头（TS/JS 使用 `/* */`，Python/Shell 使用 `#`，HTML/Markdown 使用 `<!-- -->`）。
- 新增配置项：`commentStyleByLanguage` / `commentStyleByExtension` / `unknownFileBehavior`。

## [0.0.4] - 2026-01-18

- 当文件未被 Git 跟踪或无 Git 历史时，`@Author` 回退为当前 Git 用户名（`git config user.name`）。