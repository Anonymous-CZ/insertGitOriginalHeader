# Releasing

本文档描述如何打包与发布该 VS Code 扩展。

## 版本号与变更说明

1. 更新 `package.json#version`
2. 更新 `CHANGELOG.md`（如本仓库使用 README 维护更新日志，也请同步）

## 本地验证

- 安装依赖：`pnpm install`
- 类型检查：`pnpm run check-types`
- Lint：`pnpm run lint`
- 测试：`pnpm test`

## 打包 VSIX

- 生成 VSIX：`pnpm run vsix`

产物将是一个 `.vsix` 文件，可用于 VS Code 的“从 VSIX 安装”。

## 发布到 Marketplace（可选）

发布到 VS Code Marketplace 需要：

- 已配置 `publisher`（在 `package.json` 中）
- 拥有对应发布者权限与 token
- 安装并登录 `vsce`

具体发布命令通常为：

- `vsce publish`

> 注意：发布流程与权限配置因组织而异，请按实际仓库/组织规范执行。

## 发布检查清单

- [ ] `LICENSE` 存在且 `package.json#license` 一致
- [ ] README 中包含许可证/贡献/安全/支持链接
- [ ] `pnpm run check-types` 通过
- [ ] `pnpm run lint` 通过
- [ ] `pnpm test` 通过（如启用）
- [ ] `pnpm run vsix` 产物可安装并验证核心功能
