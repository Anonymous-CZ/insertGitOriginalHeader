# Design Notes: 注释规范与写法约定

## Goals
- 注释回答“这段代码的职责、边界、约束、为什么这样做”。
- 在不改行为的前提下，提高可读性与可维护性。

## File Header (`@Description`)
- 一句话说明该文件负责什么。
- 如需要补充，最多再加一句说明边界（例如“不含 VS Code API 交互，仅纯逻辑”）。

## Function Doc (JSDoc)
- 对导出函数/关键内部函数写详细 JSDoc。
- 推荐结构：
  - 摘要：一句话说明功能
  - 详细：关键规则/边界/兜底
  - `@param`：含义 + 约束（空字符串、格式等）
  - `@returns`：返回值含义（尤其是 `null`/空字符串）
  - 示例或“Scenario”说明（1 条即可）

## Variable Comments
- 尽量 1 行内，使用 `//`。
- 注释重点：格式（例如 `YYYY-MM-DD HH:mm:ss`）、单位（ms/秒）、来源（git/文件系统/vscode）。
- 避免解释显而易见的实现（如 `trim()`、`map()` 本身）。

## Inside-function Comments
- 尽量不写。
- 仅在以下情况写：
  - Git 命令/路径转义的原因
  - 时间选择/兜底规则的业务含义
  - 非直观的边界处理（例如：Windows birthtime 可能无效）

## Out of Scope
- 本提议不定义新的用户可见行为。
- 若注释过程中发现“现有行为需要调整”，应另起变更提议（功能性 change）。
