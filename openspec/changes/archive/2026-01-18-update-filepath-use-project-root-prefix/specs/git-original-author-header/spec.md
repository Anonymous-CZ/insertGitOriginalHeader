## ADDED Requirements

### Requirement: @FilePath 使用项目根目录前缀
系统 SHALL 在插入文件头时，将 `@FilePath` 生成为“从项目根目录开始”的路径，并以工作区文件夹名作为根目录前缀。

路径格式规则：
- `@FilePath` SHALL 以 `/` 开头
- `@FilePath` SHALL 使用 `/` 作为路径分隔符（跨平台一致）
- `@FilePath` SHALL 包含所属工作区文件夹名（multi-root 场景必须避免歧义）

#### Scenario: 单根工作区生成带前缀的路径
- **GIVEN** 当前工作区文件夹名为 `insertGitOriginalHeader`
- **AND** 当前文件的工作区相对路径为 `src/extension.ts`
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@FilePath` SHALL 等于 `/insertGitOriginalHeader/src/extension.ts`

#### Scenario: 多根工作区生成带所属根的路径
- **GIVEN** 当前为多根工作区
- **AND** 当前文件属于工作区文件夹 `A`
- **AND** 文件在该文件夹内的相对路径为 `src/index.ts`
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@FilePath` SHALL 等于 `/A/src/index.ts`

#### Scenario: Windows 环境下分隔符规范化
- **GIVEN** 运行环境为 Windows
- **AND** 目标文件在工作区内
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@FilePath` SHALL 不包含 `\\`
- **AND** `@FilePath` SHALL 使用 `/` 作为分隔符

## MODIFIED Requirements

### Requirement: 不改变字段内容语义
系统 SHALL 不改变 `@Author` / `@Date` / `@LastEditors` / `@LastEditTime` / `@Description` 的语义与生成规则。
`@FilePath` 的生成规则以“项目根目录前缀”要求为准（见新增 requirement）。

#### Scenario: 修改 @FilePath 不影响其他字段
- **GIVEN** 用户在任意支持注释的文件类型中执行命令
- **WHEN** 系统按新规则生成 `@FilePath`
- **THEN** `@Author` / `@Date` / `@LastEditors` / `@LastEditTime` SHALL 仍按既有规则生成
