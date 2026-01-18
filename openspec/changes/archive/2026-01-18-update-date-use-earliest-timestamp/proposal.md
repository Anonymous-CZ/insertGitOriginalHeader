# Change: 使用“Git 原始提交时间 vs 文件创建时间”的最早值作为 @Date

## Why
目前文件头的 `@Date` 直接使用 Git 历史中的“最早提交时间”。但在部分场景下，文件的文件系统创建时间早于首次提交时间（例如：先创建/拷贝文件，之后才加入仓库并提交）。

为了让文件头的时间更接近“文件最早出现的时间”，当“Git 原始提交时间”和“文件创建时间”存在差异时，应当采用两者中更早的那个时间。

## What Changes
- 读取当前文件的文件系统创建时间（若可用）。
- 将 `@Date` 设置为：`min(gitOriginalCommitDate, fileBirthTime)`（取两者中更早的时间）。
- 当任一时间不可用时，使用可用的那一个；都不可用时使用兜底值。

> 说明：该变更只影响插入的 `@Date` 字段内容，不改变 `@Author`（仍以 Git 原始作者为准）与其它字段。

## Impact
- Affected specs: `git-original-author-header`
- Affected code:
  - `src/extension.ts`（增加文件创建时间读取与时间选择逻辑）
- Behavior change: 用户插入的 `@Date` 可能变得更早（当文件创建时间早于首次提交时间）。

## Out of Scope
- 按文件类型自动选择注释风格（`//`、`/* */`、`#`、`<!-- -->`）。
- 重构整体结构/多命令支持。
