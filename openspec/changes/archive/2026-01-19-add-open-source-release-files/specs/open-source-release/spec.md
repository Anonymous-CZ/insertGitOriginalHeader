# open-source-release Specification Delta

## ADDED Requirements

### Requirement: 仓库根目录提供开源许可证文件
仓库 SHALL 在根目录包含 `LICENSE` 文件，并且该许可证 SHALL 为 OSI 认可的开源许可证。

#### Scenario: 用户查看仓库许可信息
- **GIVEN** 用户访问仓库根目录
- **WHEN** 用户查找许可证信息
- **THEN** 用户 SHALL 能在根目录找到 `LICENSE`

### Requirement: package.json 声明 SPDX license 标识符
仓库 SHALL 在 `package.json` 中声明 `license` 字段，且该值 SHALL 为 SPDX 标识符，并与 `LICENSE` 内容一致。

#### Scenario: 构建/发布工具读取 license 字段
- **GIVEN** `package.json` 存在 `license` 字段
- **WHEN** 发布工具或用户读取该字段
- **THEN** 该值 SHALL 为有效的 SPDX 标识符
- **AND** 该标识符 SHALL 与 `LICENSE` 所选许可证一致

### Requirement: package.json 包含仓库链接元数据
仓库 SHALL 在 `package.json` 中包含 `repository` / `bugs` / `homepage` 等元数据，以便发布渠道与用户能够快速定位源码与问题反馈入口。

#### Scenario: 用户从 Marketplace 跳转到源码与 Issue
- **GIVEN** `package.json` 包含 `repository` / `bugs` / `homepage`
- **WHEN** 用户在发布页/仓库信息中查找源码与反馈入口
- **THEN** 用户 SHALL 能通过这些字段跳转到源码仓库、Issue 列表与项目主页

### Requirement: 提供贡献指南
仓库 SHALL 提供 `CONTRIBUTING.md`，包含最小可执行的贡献路径（如何开发、如何运行测试、如何打包）。

#### Scenario: 新贡献者尝试在本地运行
- **GIVEN** 新贡献者克隆了仓库
- **WHEN** 其按照 `CONTRIBUTING.md` 的步骤操作
- **THEN** 其 SHALL 能运行 lint/test/打包中的至少一条主流程命令（例如 `pnpm test` 或 `pnpm run vsix`）

### Requirement: 提供行为准则
仓库 SHALL 提供 `CODE_OF_CONDUCT.md`，用于说明社区行为边界与执行方式。

#### Scenario: 发生不当行为
- **GIVEN** 仓库存在社区协作
- **WHEN** 贡献者需要了解行为准则
- **THEN** 其 SHALL 能在 `CODE_OF_CONDUCT.md` 中找到期望行为与举报/处理方式

### Requirement: 提供安全漏洞报告指引
仓库 SHALL 提供 `SECURITY.md`，描述如何报告安全漏洞以及维护方的响应预期。

#### Scenario: 用户发现潜在安全问题
- **GIVEN** 用户发现潜在安全漏洞
- **WHEN** 用户查找报告渠道
- **THEN** 用户 SHALL 能在 `SECURITY.md` 中找到报告方式与期望响应时间

### Requirement: 提供支持与反馈渠道说明
仓库 SHALL 提供 `SUPPORT.md`，描述如何提问/报 bug、维护方期望的输入信息、以及响应预期。

#### Scenario: 用户遇到使用问题
- **GIVEN** 用户遇到使用问题
- **WHEN** 用户需要寻求帮助
- **THEN** 用户 SHALL 能在 `SUPPORT.md` 中找到首选支持渠道与提交信息要求

### Requirement: 提供发布流程说明
仓库 SHALL 提供发布流程文档（`RELEASING.md` 或 `docs/releasing.md`），并在 README 中可发现。

#### Scenario: 维护者进行版本发布
- **GIVEN** 维护者需要发布新版本
- **WHEN** 维护者查找发布步骤
- **THEN** 其 SHALL 能在发布流程文档中找到版本号变更、打包命令与验证清单
