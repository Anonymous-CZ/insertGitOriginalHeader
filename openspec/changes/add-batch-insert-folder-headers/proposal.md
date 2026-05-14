# Change: Add batch header insertion for folders

## Why
当前扩展仅支持对“当前编辑文件”插入文件头。当需要为某个文件夹（含子目录）中大量缺失文件头的文件补齐注释时，逐个打开文件执行命令成本高且容易遗漏。

该变更新增“对文件夹批量补充缺失文件头注释”的能力，在不改变单文件插入语义的前提下，提升批量补齐效率，并提供可取消的进度与结果报告。

## What Changes
- 新增命令：`git-original-author-header.batchInsertMissingHeadersInFolder`
	- 支持从资源管理器右键文件夹触发
	- 支持从命令面板触发（弹窗选择目标文件夹）
- 新增批量处理流程
	- 递归扫描目标文件夹下的文件
	- 按规则过滤（排除常见构建/依赖目录、锁文件、可配置模式等）
	- 检测文件是否已包含本扩展插入过的文件头（仅检查前 N 行）
	- 仅对“缺失文件头”的文件执行插入
	- 以进度条展示执行过程并支持取消
	- 结束后展示汇总结果，并可生成可复制的处理报告
- 新增配置项（均在 `git-original-author-header.*` 命名空间下）
	- `batchConcurrency`：批量处理最大并发数（默认 5）
	- `batchExcludePatterns`：批量处理排除的 glob 模式（默认包含 `**/node_modules/**`、`**/.git/**`、`**/dist/**`、`**/build/**`、`**/out/**` 等）
	- `batchIncludeExtensions`：允许处理的扩展名白名单（默认常见源码/文本扩展名；为空表示不过滤扩展名）
	- `commentCheckLines`：检测“是否已有文件头”时读取前几行（默认 20）
	- `skipBinaryFiles`：是否跳过二进制文件（默认 true）
	- `continueOnError`：处理失败是否继续（默认 false）
	- `generateReport`：是否生成处理报告（默认 true）

## Impact
- Affected specs:
	- `git-original-author-header`
- Affected code (planned):
	- `src/extension.ts`（注册命令、读取配置、UI/UX 交互）
	- 新增批量处理相关模块（文件扫描、过滤、文件头检测、并发队列、报告生成）
	- `package.json`（命令/菜单/配置贡献点）
- Tests (planned):
	- 新增/扩展单元测试：文件过滤、文件头检测、并发队列与报告格式
	- 新增/扩展集成测试：文件夹批量执行、取消、失败继续/中止策略
