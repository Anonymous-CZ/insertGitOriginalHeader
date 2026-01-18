# git-original-author-header Specification

## Purpose
TBD - created by archiving change update-date-use-earliest-timestamp. Update Purpose after archive.
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

