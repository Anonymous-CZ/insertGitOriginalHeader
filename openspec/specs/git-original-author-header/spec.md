# git-original-author-header Specification

## Purpose
为当前编辑文件插入“Git 原始作者信息”的文件头注释，并在不同文件类型下使用合适的注释风格，保证插入内容尽量不破坏文件语法。

该文件头包含 `@Author` / `@Date` / `@LastEditors` / `@LastEditTime` / `@FilePath` / `@Description` 等字段，其中：
- `@Author` 来自 Git 历史中的最早提交作者
- `@Date` 为“Git 原始提交时间”和“文件创建时间”中更早者（带兜底）
- 注释包裹方式会随文件类型变化，且可被用户配置覆盖
## Requirements
### Requirement: 选择最早日期写入 @Date
系统 SHALL 在插入文件头时，为 `@Date` 字段选择“Git 原始提交时间”和“文件创建时间”中更早的那个时间。

#### Scenario: 文件创建时间早于 Git 原始提交时间
- **GIVEN** 文件存在可用的文件创建时间 `T_file`
- **AND** Git 原始提交时间可用且为 `T_git`
- **AND** `T_file < T_git`
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@Date` SHALL 等于 `T_file`（以 `YYYY-MM-DD HH:mm:ss` 格式写入）

#### Scenario: Git 原始提交时间早于文件创建时间
- **GIVEN** 文件存在可用的文件创建时间 `T_file`
- **AND** Git 原始提交时间可用且为 `T_git`
- **AND** `T_git <= T_file`
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@Date` SHALL 等于 `T_git`（以 `YYYY-MM-DD HH:mm:ss` 格式写入）

#### Scenario: 文件创建时间不可用时回退到 Git 时间
- **GIVEN** 文件创建时间不可用或不可解析
- **AND** Git 原始提交时间可用
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@Date` SHALL 等于 Git 原始提交时间

#### Scenario: Git 时间不可用时回退到文件创建时间
- **GIVEN** Git 原始提交时间不可用或不可解析
- **AND** 文件创建时间可用
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@Date` SHALL 等于文件创建时间

#### Scenario: 两者都不可用时使用兜底值
- **GIVEN** Git 原始提交时间不可用或不可解析
- **AND** 文件创建时间不可用或不可解析
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@Date` SHALL 等于 `1970-01-01 00:00:00`

### Requirement: 不改变 @Author 语义
系统 SHALL 继续使用 Git 的“原始作者”作为 `@Author` 字段，且该语义不因文件创建时间的引入而改变。

#### Scenario: 文件创建时间早于 Git 时间时仍使用 Git 原始作者
- **GIVEN** 文件创建时间早于 Git 原始提交时间
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@Author` SHALL 等于 Git 原始作者

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
- **GIVEN** 当前文档 `languageId` 为 `html` 或 `markdown`
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** 插入的文件头 SHALL 使用 `<!-- ... -->` 作为外层注释包裹

### Requirement: 支持用户配置覆盖注释风格映射
系统 SHALL 支持用户通过 VS Code Settings 覆盖默认的注释风格选择规则（至少支持按 `languageId` 与扩展名覆盖）。

#### Scenario: 用户按 languageId 覆盖默认映射
- **GIVEN** 用户配置将 `python` 的注释风格设置为某一指定风格 `S`
- **WHEN** 用户在 `languageId=python` 的文档中执行命令
- **THEN** 系统 SHALL 使用 `S` 包裹文件头注释（而非默认值）

#### Scenario: 用户按扩展名覆盖默认映射
- **GIVEN** 用户配置将扩展名 `.proto` 的注释风格设置为某一指定风格 `S`
- **WHEN** 用户在扩展名为 `.proto` 的文档中执行命令
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

### Requirement: 新文件（无 Git 历史）时为 @Author 提供兜底
当系统无法获取目标文件的 Git 原始作者时，系统 SHALL 使用当前 Git 用户名作为 `@Author` 的兜底值。

#### Scenario: 未跟踪文件回退到当前 Git 用户名
- **GIVEN** 目标文件未被 Git 跟踪或不存在可用的 Git 历史
- **AND** 当前 Git 用户名可用（`git config user.name` 返回非空字符串）
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@Author` SHALL 等于当前 Git 用户名

#### Scenario: 当前 Git 用户名不可用时回退到 Unknown
- **GIVEN** 目标文件未被 Git 跟踪或不存在可用的 Git 历史
- **AND** 当前 Git 用户名不可用或为空
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@Author` SHALL 等于 `Unknown Author`

#### Scenario: 有 Git 历史时不使用兜底
- **GIVEN** 目标文件存在可用的 Git 原始作者
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@Author` SHALL 等于 Git 原始作者

