# Change: Add LastEditors/LastEditTime update commands

## Why
当前扩展会在插入文件头时写入 `@LastEditors` 与 `@LastEditTime`，但当文件后续被修改时，这两个字段不会自动更新，容易与实际编辑状态不一致。

为减少手工维护成本，需要提供“单文件更新”和“文件夹批量更新”两种能力，仅更新头注释中的 `@LastEditors` / `@LastEditTime` 字段，不改动其余字段语义。

## What Changes
- 新增单文件命令：`git-original-author-header.updateHeaderLastEditMeta`
  - 在当前活动文件中定位扩展生成的文件头
  - 仅更新 `@LastEditors` 与 `@LastEditTime`
- 新增批量命令：`git-original-author-header.batchUpdateHeaderLastEditMetaInFolder`
  - 递归扫描文件夹并筛选“已存在扩展文件头”的文件
  - 批量更新 `@LastEditors` 与 `@LastEditTime`
  - 复用现有批量配置（并发、排除规则、二进制跳过、错误策略、报告）
- 新增可选设置：`git-original-author-header.autoUpdateLastEditOnSave`（默认 `false`）
  - 启用后，在文件保存时自动刷新文件头中的 `@LastEditors` 与 `@LastEditTime`
  - 仅在检测到扩展文件头且包含 Last 字段时生效
- 新增可复用的头注释字段更新逻辑
  - 支持块注释与行注释场景
  - 保留原注释风格与行前缀，不改变 `@Author` / `@Date` / `@FilePath` / `@Description`

## Impact
- Affected specs:
  - `git-original-author-header`
- Affected code:
  - `src/extension.ts`
  - `src/insertHeader.ts`
  - `src/batch/batchInsertMissingHeadersInFolder.ts`
  - `src/batch/headerDetector.ts`
  - `package.json`
  - `README.md`
- Tests:
  - 新增头注释 Last 字段更新的单元测试
  - 补充检测/批量流程相关测试
