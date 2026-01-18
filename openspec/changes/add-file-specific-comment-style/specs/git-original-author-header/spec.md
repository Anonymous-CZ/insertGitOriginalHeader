## ADDED Requirements

### Requirement: 根据文件类型选择文件头注释风格
系统 SHALL 在插入文件头时，根据当前文档类型选择与该文件类型匹配的注释风格，以保证插入内容在该语言中是语法合法的注释。

#### Scenario: TypeScript/JavaScript 使用 C 风格块注释
- **GIVEN** 当前文档 `languageId` 为 `typescript` 或 `javascript`
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** 插入的文件头 SHALL 使用 `/* ... */` 作为外层注释包裹

#### Scenario: Python/Shell 使用 # 行注释
- **GIVEN** 当前文档 `languageId` 为 `python` 或 `shellscript`
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** 插入的文件头 SHALL 使用 `# ` 作为每一行的注释前缀

#### Scenario: HTML/Markdown 使用 HTML 注释
- **GIVEN** 当前文档 `languageId` 为 `html` 或 `markdown`（或其它标记语言类文档）
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** 插入的文件头 SHALL 使用 `<!-- ... -->` 作为外层注释包裹

### Requirement: 支持用户配置覆盖注释风格映射
系统 SHALL 支持用户通过 VS Code Settings 覆盖默认的注释风格选择规则（至少支持按 `languageId` 覆盖）。

#### Scenario: 用户按 languageId 覆盖默认映射
- **GIVEN** 用户配置将 `python` 的注释风格设置为某一指定风格 `S`
- **WHEN** 用户在 `languageId=python` 的文档中执行命令
- **THEN** 系统 SHALL 使用 `S` 包裹文件头注释（而非默认值）

### Requirement: 对无注释语法的文件类型提供安全兜底
当目标文件类型不支持注释语法或无法安全判断注释风格时，系统 SHALL 采用不会破坏文件语法的兜底行为。

#### Scenario: JSON 文件默认不插入并提示
- **GIVEN** 当前文档类型为严格 `json`（不支持注释）
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** 系统 SHALL 不插入文件头
- **AND** 系统 SHALL 向用户显示可操作提示（例如建议在设置中为该类型指定风格或改用 `jsonc`）

### Requirement: 不改变字段内容语义
系统 SHALL 仅改变文件头的“注释包裹方式”，不改变 `@Author` / `@Date` / `@LastEditors` / `@LastEditTime` / `@FilePath` 等字段语义与生成规则。

#### Scenario: 更换注释风格不影响字段生成
- **GIVEN** 同一文件在不同注释风格下插入文件头
- **WHEN** 用户执行命令
- **THEN** 字段内容的取值规则 SHALL 与既有规则一致（仅外层注释符号不同）
