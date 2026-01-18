## 1. Specification
- [ ] 1.1 为 `git-original-author-header` 编写 spec delta：新增“按文件类型选择注释风格”的需求与场景

## 2. Implementation
- [ ] 2.1 新增注释风格类型与默认映射（按 `languageId` / 扩展名）
- [ ] 2.2 新增 header 渲染 helper：将“内容行生成”与“注释包裹”解耦
- [ ] 2.3 在命令执行时根据文档类型选择注释风格，并生成对应 header
- [ ] 2.4 增加配置读取：支持按 `languageId` / 扩展名覆盖默认映射
- [ ] 2.5 实现未知/不支持注释类型的兜底策略（默认不破坏文件；提示用户）
- [ ] 2.6 更新 `package.json` `contributes.configuration`：暴露上述设置项

## 3. Tests
- [ ] 3.1 单测：`wrapWithComment()` 对不同 `CommentStyle` 输出符合预期
- [ ] 3.2 单测：`resolveCommentStyle()`（配置覆盖/默认映射/兜底）
- [ ] 3.3（可选）集成测试：对典型语言文件插入后首行注释符号正确

## 4. Validation
- [ ] 4.1 运行 `pnpm run lint` / `pnpm run check-types`
- [ ] 4.2 运行 `pnpm test`
