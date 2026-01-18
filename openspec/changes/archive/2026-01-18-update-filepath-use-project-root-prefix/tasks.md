## 1. Specification
- [x] 1.1 为 `git-original-author-header` 编写 spec delta：新增 @FilePath 项目根目录前缀规则，并修订“字段语义不变”相关表述

## 2. Implementation
- [x] 2.1 更新 `src/extension.ts`：将 `@FilePath` 由 `asRelativePath(filePath)` 改为带 workspace folder 的路径，并确保以 `/` 开头且分隔符为 `/`

## 3. Tests
- [x] 3.1 为 `@FilePath` 新规则补充单测（优先在 `src/header.ts`/纯函数层；若需要可对路径规范化逻辑提取 helper）

## 4. Validation
- [x] 4.1 运行 `openspec validate update-filepath-use-project-root-prefix --strict --no-interactive`
- [x] 4.2 运行 `pnpm run lint`
- [x] 4.3 运行 `pnpm run check-types`
- [x] 4.4 运行 `pnpm test`
