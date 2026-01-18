## 1. Specification
- [x] 1.1 为 `git-original-author-header` 编写 spec delta（新增/修改需求 + 场景）

## 2. Implementation
- [x] 2.1 抽取/新增获取文件创建时间的 helper（基于 Node.js `fs.stat` / `stat.birthtime`）
- [x] 2.2 实现时间比较与选择：取 Git 原始提交时间与文件创建时间的更早者
- [x] 2.3 将选择后的时间写入文件头 `@Date`
- [x] 2.4 增加失败兜底与可观测性（不可用/解析失败时的回退逻辑）

## 3. Tests
- [x] 3.1 为“时间选择”逻辑添加单元测试（不依赖 VS Code API）
- [x] 3.2（可选）增加扩展集成测试覆盖“插入文件头后 @Date 符合规则”

## 4. Validation
- [x] 4.1 运行 `pnpm run lint` / `pnpm run check-types`
- [x] 4.2 运行 `pnpm test`
