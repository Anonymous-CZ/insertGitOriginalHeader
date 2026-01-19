# Contributing

欢迎贡献！本项目是一个 VS Code 扩展（TypeScript），用于为当前文件插入 Git 原始作者信息文件头。

## 开发环境

- Node.js（建议与 VS Code 扩展生态兼容的 LTS）
- pnpm
- 本机可用的 Git（在 PATH 中）

## 本地开发

- 安装依赖：`pnpm install`
- 类型检查：`pnpm run check-types`
- 构建（打包扩展）：`pnpm run compile`
- 监听构建：`pnpm run watch`

## 测试

- 运行测试：`pnpm test`

> 说明：测试使用 VS Code 扩展测试框架，首次运行可能需要下载 VS Code 测试环境。

## 代码风格

- 语言：TypeScript
- 缩进：保持与现有代码一致（Tab）
- 建议先运行：`pnpm run lint`

## 提交与 PR

- 尽量将改动拆成小而清晰的提交
- PR 描述中请说明：变更动机、行为变化、验证方式（例如运行了哪些命令）

## 报告问题

- 非安全问题：请使用 GitHub Issues（若仓库未开启 Issues，请在 README 中给出的渠道反馈）
- 安全问题：请不要公开发 Issue，参考 SECURITY.md
