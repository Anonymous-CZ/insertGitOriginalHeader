# Change: 新文件（无 Git 历史）时为 @Author 提供兜底

## Why
当文件是新建/未被 Git 跟踪时，`git log -- <file>` 无输出，当前实现会将 `@Author` 写成 `Unknown Author`，导致“新文件使用注释时获取不到作者”。

## What Changes
- 当目标文件无法获取 Git 原始作者时，`@Author` 将回退为当前 Git 用户名（`git config user.name`）。
- 当当前 Git 用户名也不可用时，`@Author` 继续使用兜底值（保持现有 Unknown 行为）。
- 对已被 Git 跟踪且存在历史的文件，`@Author` 仍然使用 Git 原始作者（不改变语义）。

## Impact
- Affected specs: `openspec/specs/git-original-author-header/spec.md`
- Affected code:
	- `src/extension.ts`（作者获取与兜底逻辑）
	- 可能新增纯函数 helper 以便测试（例如 author 选择策略）
- Compatibility: 非破坏性变更；仅在 Git 原始作者不可用时改变 `@Author` 从 Unknown → 当前用户
