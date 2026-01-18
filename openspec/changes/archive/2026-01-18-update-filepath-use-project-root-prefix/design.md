# Design Notes: @FilePath 项目根目录前缀

## Overview
目标是让 `@FilePath` 从“工作区相对路径”升级为“带项目根目录前缀的路径”，且具有跨平台一致性。

期望输出形态：
- `/<workspaceFolderName>/<pathRelativeToThatFolder>`
- 始终使用 `/` 作为分隔符

示例：
- 工作区文件夹名：`insertGitOriginalHeader`
- 文件：`src/extension.ts`
- 输出：`/insertGitOriginalHeader/src/extension.ts`

## Proposed Implementation
- 使用 VS Code API：`vscode.workspace.asRelativePath(filePath, true)`
  - `true` 使其在 multi-root 场景下包含工作区文件夹名（例如 `insertGitOriginalHeader/src/extension.ts`）
- 对返回结果做规范化：
  1. 将 `\\` 替换为 `/`（Windows 路径兼容）
  2. 若不以 `/` 开头，则补一个 `/`

## Edge Cases
- 文件不在当前工作区内：`asRelativePath` 可能回传原始路径。
  - 本提议优先保证“工作区内文件”行为正确；非工作区文件的处理保持现状或按最小改动兜底（在 spec 场景中明确）。
- 多根工作区：必须包含 workspace folder name，确保同名相对路径不冲突。

## Backward Compatibility
- 这是输出格式变更：旧值 `src/extension.ts` 会变为 `/insertGitOriginalHeader/src/extension.ts`。
- 对依赖此字段做字符串匹配的用户，可能需要更新规则（但扩展本身无对外 API）。
