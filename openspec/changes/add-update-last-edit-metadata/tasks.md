## 1. Contribution Points
- [x] 1.1 Add single-file update command contribution (`git-original-author-header.updateHeaderLastEditMeta`)
- [x] 1.2 Add batch update command contribution (`git-original-author-header.batchUpdateHeaderLastEditMetaInFolder`)
- [x] 1.3 Add Explorer folder context menu contribution for batch update command
- [x] 1.4 Add optional config `autoUpdateLastEditOnSave` (default off)

## 2. Core Update Logic
- [x] 2.1 Implement reusable updater that only rewrites `@LastEditors` and `@LastEditTime` lines in existing extension header
- [x] 2.2 Keep all other header fields and comment wrappers unchanged
- [x] 2.3 Return explicit outcomes for inserted/updated/skipped/failed paths

## 3. Single-file Command
- [x] 3.1 Implement command flow for active editor
- [x] 3.2 Handle skip reasons (no header / non-file document / dirty document)
- [x] 3.3 Show clear user messages

## 3.5 Save Hook
- [x] 3.5.1 Implement on-save hook to auto-refresh Last fields when enabled
- [x] 3.5.2 Keep default behavior disabled unless user turns it on

## 4. Batch Command
- [x] 4.1 Implement folder scan for files that already contain extension header
- [x] 4.2 Batch update with progress + cancellation + error policy
- [x] 4.3 Generate summary/report consistent with existing batch command

## 5. Tests
- [x] 5.1 Add unit tests for LastEditors/LastEditTime line replacement
- [x] 5.2 Add tests for header detection conditions used by update path

## 6. Docs
- [x] 6.1 Update README with new single/batch update usage
- [x] 6.2 Update changelog (Unreleased)

## 7. Validation
- [x] 7.1 Run `pnpm run check-types`
- [x] 7.2 Run `pnpm test`
