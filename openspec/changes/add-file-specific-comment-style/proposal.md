# Change: 根据文件类型选择注释方式插入文件头

## Why
当前扩展无论文件类型都会插入 `<!-- ... -->` 注释块。对 TypeScript/Java/Python 等非 HTML/Markdown 文件，这会导致语法错误或破坏文件可执行性。

用户希望“根据文件不同添加对应的注释方式”，以确保插入的文件头在目标语言中合法且可读。

## What Changes
- 根据当前编辑文档的类型（优先 `languageId`，其次文件扩展名）选择注释包裹方式。
- 内置一组常见语言/扩展名到注释风格的默认映射。
- 支持通过 VS Code Settings 覆盖/扩展映射（按 `languageId` 或扩展名指定）。
- 对不支持注释或无法判断注释风格的文件类型，提供安全兜底行为（默认不破坏文件），并给出可操作的提示。

## Impact
- Affected specs: `git-original-author-header`
- Affected code:
  - `src/extension.ts`（改造 header 渲染与注释选择逻辑）
  - `package.json`（新增配置项：注释风格映射）
  - 可能新增：`src/commentStyle.ts` / `src/header.ts`（纯逻辑 helper，便于测试）
- Behavior change:
  - 插入的文件头外层注释将因文件类型而变化。
  - 对“无法安全插入”的文件类型，可能从“强行插入”改为“提示并跳过”。

## Out of Scope
- 自定义模板字段增删/重排（本变更仅调整注释包裹方式，不改变字段语义）。
- 自动检测并跳过“文件已存在头注释”的去重/更新逻辑。
- 基于 AST/formatter 的深度语言解析。
