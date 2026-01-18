# Project Context

## Purpose
这是一个 VS Code 扩展（extension），用于为当前编辑文件插入“Git 原始作者信息”文件头。

核心目标：
- 从 Git 历史中获取该文件的最早提交作者与时间（原始作者/原始提交时间）
- 获取当前 Git 用户名作为“最后编辑者”（LastEditors）并写入当前时间（LastEditTime）
- 将以上信息以固定模板插入到文件顶部，方便追溯来源与编辑记录

范围边界：
- 只在本地工作区内运行；不涉及网络请求与远端 API
- 以调用本机 `git` 命令为准，不实现 Git 协议或自行解析对象库

## Tech Stack
- VS Code Extension API（`vscode`）
- TypeScript（严格模式 `strict: true`）
- Node.js 运行时（扩展宿主），模块配置 `module: Node16`，目标 `ES2022`
- 构建打包：esbuild（输出 `dist/extension.js`，CJS bundle，`external: ['vscode']`）
- 包管理：pnpm
- 代码检查：ESLint（`eslint.config.mjs` + `typescript-eslint`）
- 测试：Mocha + `@vscode/test-electron` / `@vscode/test-cli`（`vscode-test` 脚本）
- 发布打包：`@vscode/vsce`（生成 `.vsix`）

## Project Conventions

### Code Style
- 语言：TypeScript
- 缩进：当前代码与 `tsconfig.json` 使用 Tab；新增代码保持一致（不要混用空格缩进）。
- 命名：遵循 `@typescript-eslint/naming-convention`，import 名称使用 `camelCase` 或 `PascalCase`。
- 规则偏好：
	- `eqeqeq`、`curly`、`semi` 等基础规则开启（当前为 `warn`）
	- 避免抛出非 Error（`no-throw-literal`）
- 日志/提示：面向用户的反馈使用 `vscode.window.showInformationMessage/showWarningMessage`；调试信息可用 `console.log`，但发布版本建议保持克制。
- 与 Git 命令相关的字符串拼接必须考虑路径与引号转义（避免破坏命令行参数）。

文件头模板约定（当前实现）：
- 使用 HTML 注释块 `<!-- ... -->` 插入到文件第一行
- 字段：`@Author`、`@Date`、`@LastEditors`、`@LastEditTime`、`@FilePath`、`@Description`

### Architecture Patterns
- 单命令扩展：通过 `contributes.commands` 注册命令 `git-original-author-header.insertGitOriginalHeader`，并在 `activate()` 中绑定实现。
- 数据获取模式：
	- 通过 `child_process.exec` 调用本机 `git` CLI 获取最早提交信息（author + date）
	- 通过 `git config user.name` 获取当前 Git 用户名
- 编辑器写入模式：通过 `TextEditor.edit` 在 `(0,0)` 插入文本。
- 打包模式：esbuild bundle；运行时依赖 `vscode` 作为 external。

实现位置约定：
- 扩展主入口：`src/extension.ts`
- 打包输出：`dist/extension.js`
- 构建脚本：`esbuild.js`

### Testing Strategy
- 使用 Mocha 作为测试框架，配合 VS Code 扩展测试运行器（`@vscode/test-*`）。
- 单测范围建议：
	- 纯函数/字符串模板拼接（如文件头生成）应尽量提取为可测试的 helper（不依赖 VS Code API）
	- 与 VS Code API/编辑器交互的部分以集成测试为主
- 当前仓库包含示例测试用例（`src/test/extension.test.ts`），如新增功能建议补充覆盖核心行为。

### Git Workflow
- 该扩展依赖 Git 历史来读取作者信息；开发/测试时建议在一个真实的 Git 仓库内进行。
- 分支策略：当前仓库未强制约定；建议采用 feature 分支（如 `feat/...`、`fix/...`）并通过 PR 合并。
- 提交信息：当前未强制 Conventional Commits；如团队协作，建议使用 `feat:`/`fix:`/`chore:` 等前缀以便生成变更日志。
- 版本发布：`package.json.version` 作为扩展版本号；打包使用 `pnpm run vsix`（内部会运行 `package`）。

## Domain Context
- “原始作者”定义：该文件在 Git 历史中的最早提交记录的作者（按提交时间正序取第一条）。
- “原始提交时间”定义：与原始作者对应的提交时间（格式化为 `YYYY-MM-DD HH:mm:ss`）。
- “最后编辑者”定义：当前用户的 Git 配置 `user.name`（不是最近一次提交者）。
- “文件路径”定义：相对工作区的路径（通过 VS Code API 计算）。

注意：对未纳入 Git 追踪或无提交历史的文件，命令应提供合理的兜底值（例如 Unknown）。

## Important Constraints
- 运行环境必须可执行 `git` 命令（本机安装 Git 且在 PATH 中可用）。
- 必须在 VS Code 工作区中使用（需要 workspace root 才能在正确目录执行 Git）。
- Git 命令执行可能较慢；避免阻塞 UI，必要时考虑缓存或异步优化。
- 文件头采用 HTML 注释模板：对非 HTML/Markdown/前端类文件可能不符合语法（当前实现未按文件类型自适配）。
- 扩展不应写入敏感信息；插入的信息仅限作者名/时间/路径等元数据。

## External Dependencies
- 本机 Git CLI（`git log`、`git config`）
- VS Code Extension Host（`vscode` API）
- 打包发布工具链：esbuild、`@vscode/vsce`
