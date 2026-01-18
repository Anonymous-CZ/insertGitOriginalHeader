# Change: @FilePath 改为从项目根目录开始

## Why
当前插入的文件头中，`@FilePath` 使用工作区相对路径（例如 `src/extension.ts`）。在以下场景中信息不够明确：
- 多根工作区（multi-root workspace）中相同相对路径可能存在歧义
- 复制到其他上下文（Issue/PR/聊天）时缺少“属于哪个项目”的提示

希望将 `@FilePath` 统一改为“从项目根目录开始”的路径形式，例如：
- 当前仓库 `src/extension.ts` 应写为 `/insertGitOriginalHeader/src/extension.ts`

## What Changes
- `@FilePath` 的生成规则改为：以工作区文件夹名作为项目根目录前缀，并以 `/` 开头。
- 路径分隔符统一为 `/`（即使在 Windows 上）。

## Non-Goals
- 不改变 `@Author` / `@Date` / `@LastEditors` / `@LastEditTime` 的语义与生成规则。
- 不改变注释风格选择规则与配置项。
- 不引入新的命令、配置项或 UI。

## Impact
- Affected specs: `git-original-author-header`（字段生成规则变更：`@FilePath`）。
- Affected code: `src/extension.ts`（构建 `relativeFilePath` 的逻辑）。
- Risk: 低；主要风险是多根工作区/非工作区文件路径的边界行为需要明确。

## Acceptance Criteria
- 单根工作区：对 `src/extension.ts` 插入文件头时，`@FilePath` 为 `/insertGitOriginalHeader/src/extension.ts`。
- 多根工作区：`@FilePath` 必须包含所属工作区文件夹名，以避免歧义。
- Windows 环境下 `@FilePath` 仍使用 `/` 分隔符，且始终以 `/` 开头。
