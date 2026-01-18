## Context
扩展通过调用本机 `git` 命令获取 `@Author`。
- 对已跟踪文件：`git log --reverse ... -- <path>` 可得到最早提交作者
- 对新文件/未跟踪文件：上述命令无输出

现状是在无输出时直接写入 `Unknown Author`，用户在“使用注释风格插入文件头”场景下体验为“获取不到作者”。

## Goals / Non-Goals
- Goals:
	- 新文件/无 Git 历史时，`@Author` 仍能写入一个合理的人名（当前 Git 用户名）。
	- 有 Git 历史时不改变 `@Author` 的来源与语义。
	- 保持实现可测试、可预测。
- Non-Goals:
	- 不尝试从文件系统账号、VS Code 用户信息或远端 Git 服务推断作者。
	- 不改变 `@LastEditors` 的语义（仍为当前 Git 用户名）。

## Decisions
- Decision: `@Author` 的选择顺序
	1) 若 Git 原始作者可用（非空），使用 Git 原始作者
	2) 否则，尝试读取当前 Git 用户名（`git config user.name`）并作为 `@Author`
	3) 若仍不可用，则回退到 `Unknown Author`

- Alternatives considered:
	- 始终使用 `git config user.name`：会改变已跟踪文件的 `@Author` 语义（拒绝）。
	- 使用 VS Code 的账户信息：实现与隐私/一致性更复杂，且与 Git 语义不一致（拒绝）。

## Risks / Trade-offs
- 在无 Git 历史时，`@Author` 与 `@LastEditors` 可能相同（这是预期且合理）。
- 如果用户未配置 `git config user.name`，仍会得到 Unknown（保留兜底）。

## Migration Plan
无需迁移；仅影响未来插入的文件头内容。

## Open Questions
- 是否需要新增一个可配置项来控制该兜底（例如 `authorFallbackBehavior`）？当前提议先不引入，保持最小变更。
