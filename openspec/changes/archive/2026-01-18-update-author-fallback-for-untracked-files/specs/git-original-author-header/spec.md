## ADDED Requirements

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
