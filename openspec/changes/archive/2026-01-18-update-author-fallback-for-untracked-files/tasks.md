## 1. Implementation
- [ ] 1.1 提取/新增“选择 Author 的兜底策略”纯函数（优先 Git 原始作者，其次当前 Git 用户名，最后 Unknown）
- [ ] 1.2 在命令执行流程中接入该策略（不改变已有文件的 Author 语义）
- [ ] 1.3 为未跟踪文件补充测试用例（至少覆盖：未跟踪 + 有 user.name；未跟踪 + 无 user.name）
- [ ] 1.4 更新 README 或变更日志说明该行为（如项目约定需要）

## 2. Validation
- [ ] 2.1 运行 `pnpm test`（或现有测试命令）确保通过
- [ ] 2.2 手工验证：新建未跟踪文件执行命令，`@Author` 为当前 Git 用户名
