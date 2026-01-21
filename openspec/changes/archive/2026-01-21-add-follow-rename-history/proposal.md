# Change: 在获取原始作者时跟随文件重命名历史

## Why
当前实现通过 `git log --reverse -1 -- <path>` 获取文件最早提交信息，但当文件发生过重命名时，这个查询只会从“重命名之后的新路径”开始计算，导致 `@Author` / Git 原始提交时间可能被错误地识别为“重命名之后的作者/时间”。

## What Changes
- 获取文件最早提交信息时，Git 查询 SHALL 跟随重命名历史（使用 `git log --follow`）。
- 明确该能力的边界：仅保证“重命名（rename）”场景的追溯；复制（copy）或内容大幅变更导致的 rename 检测失败不在本次变更范围。

## Impact
- Affected specs: `git-original-author-header`
- Affected code: `src/extension.ts`（构造 git log 命令的逻辑）
- Behavior change: 对曾被重命名的文件，`@Author` 与 Git 原始提交时间可能变更为更早的值（这是期望行为）
