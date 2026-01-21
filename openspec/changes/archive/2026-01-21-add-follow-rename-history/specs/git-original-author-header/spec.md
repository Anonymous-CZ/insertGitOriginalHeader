## ADDED Requirements

### Requirement: 跟随重命名追溯 Git 原始提交信息
系统 SHALL 在获取目标文件的“最早提交信息（作者 + 时间）”时跟随 Git 的重命名历史，以避免文件被重命名后 `@Author`/Git 原始提交时间被错误截断。

#### Scenario: 文件被重命名后仍能获取到更早的原始作者
- **GIVEN** 文件 `A` 已被提交过（存在提交记录）
- **AND** 文件 `A` 在后续提交中被重命名为 `B`
- **WHEN** 用户对当前路径为 `B` 的文件执行“插入Git原始作者文件头”命令
- **THEN** 系统 SHALL 使用跟随重命名历史的方式查询最早提交信息
- **AND** `@Author` SHALL 等于文件在重命名之前（含）历史中的最早提交作者

#### Scenario: 文件未发生重命名时行为不变
- **GIVEN** 目标文件在 Git 历史中未发生重命名
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** `@Author` 与 Git 原始提交时间 SHALL 与不跟随重命名时一致

#### Scenario: 跟随重命名查询失败时保持兜底语义
- **GIVEN** 目标文件未被 Git 跟踪或无法获取可用的 Git 历史
- **WHEN** 用户执行“插入Git原始作者文件头”命令
- **THEN** 系统 SHALL 将 Git 原始作者/时间视为不可用
- **AND** 系统 SHALL 继续使用既有兜底规则为 `@Author` 选择作者名称
