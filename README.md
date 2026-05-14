# Git Original Author Header

这是一个用于补充 koroFileHeader 的 VS Code 扩展：当你需要为他人提交的文件补充文件头注释时，koroFileHeader 无法直接获取“该文件最早提交的作者/时间”，手动查询与补齐会很麻烦。

本扩展通过读取 Git 历史，自动获取文件的原始提交作者与时间，并将其写入文件头注释，让补注释这件事变得更省事。

会根据文件类型自动选择合适的注释方式（例如 TS/JS 用 `/* */`，Python 用 `#`，HTML/Markdown 用 `<!-- -->`），并插入包含 `@Author` / `@Date` / `@LastEditors` / `@LastEditTime` 等字段的文件头。

# 更新日志

完整更新日志请查看 [CHANGELOG.md](./CHANGELOG.md)。

## [0.0.6] - 2026-01-19

### 变更
- .vue 文件现在使用 HTML 块注释风格插入文件头

## [0.0.5] - 2026-01-18

### 变更
- `@FilePath` 改为从项目根目录开始，且始终以 `/` 开头并使用 `/` 分隔符（例如 `/insertGitOriginalHeader/src/extension.ts`）。

## [0.0.4] - 2026-01-18

### 变更
- 当文件未被 Git 跟踪或无 Git 历史时，`@Author` 回退为当前 Git 用户名（`git config user.name`）。

## [0.0.3] - 2026-01-18

### 变更
- 根据文件类型选择注释风格（可通过设置覆盖）

## [0.0.2] - 2026-01-18

### 变更
- `@Date` 不再只使用 Git 的最早提交时间：会在“Git 最早提交时间”和“文件创建时间（birthtime）”中取更早的那个。
- 当 Git 时间不可用时回退到文件创建时间；两者都不可用时使用兜底值 `1970-01-01 00:00:00`。

## [0.0.1] - 2025-01-07

### 新增
- 初始版本发布
- 添加插入 Git 原始作者文件头功能

## 功能

- 获取当前文件的 Git 原始作者信息
- 获取当前文件的 Git 最早提交时间，并与文件创建时间比较后写入 `@Date`
- 将作者/时间等信息插入到文件头部作为注释
- 支持通过右键菜单或命令面板操作

## 字段说明

- `@Author`：优先通过 `git log --reverse ... -1` 获取当前文件的最早提交作者（`%an`）。若文件未被 Git 跟踪或无历史导致获取失败，则回退为 `git config user.name`。
- `@Date`：取两者中更早者（格式 `YYYY-MM-DD HH:mm:ss`）：
	- Git 最早提交时间（`%ad`，本地时间格式化）
	- 文件创建时间（Node.js `fs.stat(...).birthtime`，若可用）
- `@LastEditors`：读取 `git config user.name`（获取失败则使用默认值）。
- `@LastEditTime`：插入文件头时的当前时间。
- `@FilePath`：从项目根目录开始的路径，始终以 `/` 开头，且使用 `/` 作为分隔符（Windows 也一样）。
	- 示例：`/insertGitOriginalHeader/src/extension.ts`

## 使用方法

1. 在编辑器中右键点击，选择"插入Git原始作者文件头"
2. 或使用命令面板（Ctrl+Shift+P）输入"插入Git原始作者文件头"

## 批量补充（文件夹）

当你需要为某个文件夹（包含子文件夹）下的大量文件补齐缺失的文件头时，可以使用批量命令。

### 使用方法

1. 在资源管理器中右键点击文件夹，选择"批量补充文件头注释"
2. 或使用命令面板（Ctrl+Shift+P）输入"批量补充文件头注释"，然后选择目标文件夹

批量模式会先扫描并提示确认，只对“缺少该扩展生成的文件头”的文件执行插入，并提供进度与可取消操作。

## 安装

1. 获取 `.vsix` 文件
2. 在 VS Code 中：查看 -> 扩展 -> ... -> 从 VSIX 安装

## 从源码打包（生成 .vsix）

在仓库根目录执行：

- `pnpm install`
- `pnpm run vsix`

生成的 `.vsix` 文件可用于“从 VSIX 安装”。

## 配置

支持通过 VS Code Settings 覆盖“按文件类型选择注释方式”的规则。

### 设置项

- `git-original-author-header.commentStyleByLanguage`
	- 按 `languageId` 覆盖注释风格。
	- 可选值：`htmlBlock` / `cBlock` / `slashLine` / `hashLine` / `powershellBlock` / `luaBlock`
- `git-original-author-header.commentStyleByExtension`
	- 按文件扩展名覆盖注释风格，key 可用 `.ts` 或 `ts`。
- `git-original-author-header.unknownFileBehavior`
	- 无法识别注释方式时的行为：
		- `prompt`：弹窗让你选择一种注释方式
		- `skip`：跳过插入并提示（默认，避免破坏文件）
		- `fallback`：使用默认块注释（`cBlock`）继续插入

### 批量设置项

- `git-original-author-header.batchConcurrency`
	- 批量处理时的最大并发数。
- `git-original-author-header.batchExcludePatterns`
	- 批量处理时排除的 glob 模式。
- `git-original-author-header.batchIncludeExtensions`
	- 批量处理时允许处理的扩展名白名单（为空表示不过滤扩展名）。
- `git-original-author-header.commentCheckLines`
	- 检测文件是否已有文件头时检查的行数。
- `git-original-author-header.skipBinaryFiles`
	- 是否跳过二进制文件。
- `git-original-author-header.continueOnError`
	- 遇到错误是否继续处理后续文件。
- `git-original-author-header.generateReport`
	- 是否生成可复制的处理报告。

### 示例：settings.json

```json
{
	"git-original-author-header.commentStyleByLanguage": {
		"typescript": "cBlock",
		"python": "hashLine"
	},
	"git-original-author-header.commentStyleByExtension": {
		".vue": "htmlBlock",
		"proto": "slashLine"
	},
	"git-original-author-header.unknownFileBehavior": "prompt",
	"git-original-author-header.batchExcludePatterns": [
		"**/test/**",
		"**/*.spec.ts"
	],
	"git-original-author-header.batchConcurrency": 3
}
```

### 注意

- 对严格 `json`（不支持注释）的文件，扩展会默认跳过插入并提示你改用 `jsonc` 或在设置中明确指定规则。

## 许可证

本项目使用 MIT License，详见 [LICENSE](./LICENSE)。

相关文档：

- 贡献指南：[CONTRIBUTING.md](./CONTRIBUTING.md)
- 行为准则：[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- 安全政策：[SECURITY.md](./SECURITY.md)
- 支持与反馈：[SUPPORT.md](./SUPPORT.md)
- 发布流程：[RELEASING.md](./RELEASING.md)
