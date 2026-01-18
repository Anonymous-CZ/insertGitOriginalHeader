## 1. Specification
- [x] 1.1 复核本变更范围：确认仅为注释/文件头描述改进，不引入行为变更

## 2. Implementation
- [x] 2.1 更新 `src/extension.ts`：补齐文件头 `@Description`；为关键函数添加 JSDoc（Git 获取、注释风格选择、插入逻辑）
- [x] 2.2 更新 `src/header.ts`：补齐文件头 `@Description`；为 `renderHeaderBodyLines` / `wrapWithComment` 添加 JSDoc（输出格式、空行处理、换行约定）
- [x] 2.3 更新 `src/commentStyle.ts`：补齐文件头 `@Description`；为类型/配置读取/解析函数添加注释（unknown 行为、默认映射优先级）
- [x] 2.4 更新 `src/dateTime.ts`：补齐文件头 `@Description`；为时间格式化/解析/选择函数添加注释（期望格式、失败返回 null、最早时间规则）
- [x] 2.5 更新 `src/author.ts`：补齐文件头 `@Description`；为 `pickAuthor` 添加 JSDoc（trim 规则、fallback 逻辑）

## 3. Tests
- [x] 3.1 运行现有单测（不新增测试为硬性要求，但若发现注释暴露的边界缺测，可补充最小测试）

## 4. Validation
- [x] 4.1 运行 `pnpm run lint`
- [x] 4.2 运行 `pnpm run check-types`
- [x] 4.3 运行 `pnpm test`
