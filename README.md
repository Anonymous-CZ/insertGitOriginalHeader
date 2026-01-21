# Git Original Author Header

这是一个用于补充 koroFileHeader 的 VS Code 扩展：当你需要为他人提交的文件补充文件头注释时，koroFileHeader 无法直接获取“该文件最早提交的作者/时间”，手动查询与补齐会很麻烦。

本扩展通过读取 Git 历史，自动获取文件的原始提交作者与时间，并将其写入文件头注释，让补注释这件事变得更省事。

会根据文件类型自动选择合适的注释方式（例如 TS/JS 用 `/* */`，Python 用 `#`，HTML/Markdown 用 `<!-- -->`），并插入包含 `@Author` / `@Date` / `@LastEditors` / `@LastEditTime` 等字段的文件头。

# 更新日志

完整更新日志请查看 [CHANGELOG.md](./CHANGELOG.md)。

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

## 安装

1. 获取 `.vsix` 文件
2. 在 VS Code 中：查看 -> 扩展 -> ... -> 从 VSIX 安装

## 从源码打包（生成 .vsix）

在仓库根目录执行：

- `pnpm install`
- 推荐：`pnpm run package-vsix`
	- 产物输出到 `out/`，文件名包含版本号（例如 `out/git-original-author-header-1.0.3.vsix`）
	- CI（tag 发布）会用 tag 版本号覆盖该版本号

也可以使用：

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
	"git-original-author-header.unknownFileBehavior": "prompt"
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
