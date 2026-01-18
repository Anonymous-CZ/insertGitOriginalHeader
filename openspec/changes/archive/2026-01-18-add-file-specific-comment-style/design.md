## Context
当前实现固定使用 HTML 注释块 `<!-- ... -->` 插入文件头。这对非 HTML/Markdown/Xml 类文档不成立。

VS Code 扩展运行时可以访问：
- `TextDocument.languageId`（较稳定、与文件内容/语法高亮相关）
- `TextDocument.fileName` 扩展名（对无语言模式时可兜底）

## Goals / Non-Goals
- Goals:
  - 让插入的文件头注释对常见语言是“语法合法”的。
  - 默认行为尽量不破坏文件（例如 JSON 等无注释语法的文件）。
  - 可配置：用户能在 Settings 中覆盖默认映射。
  - 易测试：注释选择与 header 渲染应当可在单测中验证（不依赖 VS Code API）。
- Non-Goals:
  - 解析语言语法树自动推断注释语法。
  - 自动更新/替换已存在的头注释。

## Proposed Approach
### 1) 统一抽象：CommentStyle
引入内部枚举/字面量类型（示例）：
- `htmlBlock`：`<!-- ... -->`
- `cBlock`：`/* ... */`
- `slashLine`：`// ...`（逐行前缀）
- `hashLine`：`# ...`（逐行前缀）
- `powershellBlock`：`<# ... #>`
- `luaBlock`：`--[[ ... ]]`

### 2) 注释风格解析顺序
1. 用户配置覆盖（按 `languageId`）
2. 用户配置覆盖（按文件扩展名）
3. 内置默认映射（按 `languageId`）
4. 内置默认映射（按扩展名）
5. 安全兜底：
   - 若可判定为“无注释语法”（例如 `json`），默认提示并跳过插入。
   - 其它未知类型：提示用户选择一种注释风格（可选：提供“记住本次选择”的配置写入），或继续使用保守的默认（例如 `cBlock`）但明确标记风险。

> 备注：第 5 点是否引入交互式选择，可在实现阶段根据复杂度与用户反馈裁剪；但“默认不破坏文件”的底线应保持。

### 3) Header 渲染
将“字段内容”和“注释包裹方式”解耦：
- `renderHeaderLines(data) -> string[]` 生成不带注释符号的行（例如 `@Author: ...`）。
- `wrapWithComment(style, lines) -> string` 负责根据不同风格包裹：
  - `cBlock/htmlBlock/powershellBlock/luaBlock`：多行块注释
  - `hashLine/slashLine`：逐行前缀

输出应保持末尾带一个换行，便于插入到 `(0,0)`。

## Default Mapping (initial)
建议的初始默认映射（可在实现中精简/扩展）：
- `htmlBlock`：`html`, `xml`, `markdown`
- `cBlock`：`javascript`, `typescript`, `java`, `c`, `cpp`, `csharp`, `go`, `rust`, `css`, `scss`, `less`, `jsonc`
- `hashLine`：`python`, `shellscript`, `ruby`, `yaml`, `toml`, `dockerfile`
- `powershellBlock`：`powershell`
- `luaBlock`：`lua`

特殊：
- `json`（严格 JSON）默认视为“无注释语法”，避免插入导致文件不可用。

## Configuration Shape
建议新增设置（名称可在实现时对齐现有命名风格）：
- `git-original-author-header.commentStyleByLanguage`: `{ [languageId: string]: CommentStyle }`
- `git-original-author-header.commentStyleByExtension`: `{ [ext: string]: CommentStyle }`（ext 形如 `.ts` / `ts`，实现时需规范化）
- `git-original-author-header.unknownFileBehavior`: `'prompt' | 'skip' | 'fallback'`

## Risks / Trade-offs
- VS Code `languageId` 与扩展名可能不一致（例如 `.h` 可能是 C/C++）。
  - 缓解：优先 `languageId`，并允许用户覆盖。
- 部分语言同时支持多种注释（例如 JS 支持 `//` 和 `/* */`）。
  - 缓解：统一采用“更适合多行头注释”的风格（通常 `/* */`）。
- 交互式 prompt 会增加复杂度。
  - 缓解：先实现 `skip` 兜底，后续再迭代引入 prompt 和记忆。

## Open Questions
- 未知类型的默认策略：更偏向“直接跳过”还是“弹窗让用户选一次并记住”？
- 对 `plaintext` 的处理：是否默认 `hashLine`/`slashLine` 或跳过？
