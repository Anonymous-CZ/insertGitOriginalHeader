# open-source-release Specification Delta

## ADDED Requirements

### Requirement: GitHub Release 的 VSIX 附件文件名包含版本号
当仓库通过 tag（形如 `vX.Y.Z`）触发打包与 Release 流程时，工作流 SHALL 生成并上传一个包含版本号的 VSIX 文件名，以便用户能够仅通过文件名区分版本。

#### Scenario: 用户从 GitHub Release 下载 VSIX
- **GIVEN** 仓库 push 了 tag `v1.2.3` 并触发 Release 工作流
- **WHEN** 用户在 GitHub Release 页面下载 `.vsix` 附件
- **THEN** 附件文件名 SHALL 包含版本号 `1.2.3`
- **AND** 附件文件名 SHOULD 为 `git-original-author-header-1.2.3.vsix`

#### Scenario: Actions artifact 与 Release 附件一致
- **GIVEN** Release 工作流打包完成
- **WHEN** 工作流上传 Actions artifact 与 GitHub Release 附件
- **THEN** 两者 SHALL 指向同一个版本化文件名的 VSIX 产物
