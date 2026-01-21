# Design: 跟随重命名追溯原始作者

## Decision
在获取文件最早提交信息时使用 `git log --follow`，以便在文件发生重命名后仍能追溯到更早的提交记录。

## Rationale
- `--follow` 是 Git 对“单文件路径随重命名追溯”的官方开关
- 相比手动解析 `--name-status`/`--find-renames` 输出，复杂度更低，且与 Git 行为保持一致

## Command Shape
目标命令（示意）：
- `git --no-pager log --follow --pretty=format:"%an|||%ad" --date=format:"%Y-%m-%d %H:%M:%S" -- "<file>"`

实现要点：
- 默认输出顺序是从新到旧；因此通过解析 stdout 的“最后一条”作为最早提交
- 避免使用 `--reverse`：在部分平台/版本上 `--follow --reverse` 会导致重命名前历史缺失

要点：
- `--follow` 只能用于单路径文件历史追溯；因此必须保持 `-- <path>` 的形式
- `<path>` 仍需做 Windows 反斜杠到 `/` 的规范化；实现上建议通过 `execFile` 传参以避免 shell 引号问题

## Limitations / Non-goals
- 不保证跨“复制（copy）”追溯（Git 本身默认不跟随 copy 历史）
- rename 检测依赖 Git 的启发式；若内容变化过大导致无法判定为 rename，本变更不额外增加更激进的检测参数
