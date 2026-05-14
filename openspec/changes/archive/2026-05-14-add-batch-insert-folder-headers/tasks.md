## 1. Spec & Contribution Points
- [ ] 1.1 Add new command contribution (`git-original-author-header.batchInsertMissingHeadersInFolder`)
- [ ] 1.2 Add Explorer folder context menu contribution for the new command
- [ ] 1.3 Add configuration contributions for batch options (defaults + descriptions)

## 2. Batch Pipeline
- [ ] 2.1 Implement folder file scanning (recursive) with default excludes and user-configured excludes
- [ ] 2.2 Implement file filtering (extensions whitelist, skip binary, skip known lock/config files as per defaults)
- [ ] 2.3 Implement header presence detection based on first `commentCheckLines` lines
- [ ] 2.4 Reuse existing single-file header insertion logic for each file (no behavior drift)

## 3. UX
- [ ] 3.1 Implement scan summary prompt (total files / candidates / missing headers) with Continue/Cancel
- [ ] 3.2 Implement optional details view for the scan result (list URIs or relative paths)
- [ ] 3.3 Implement progress UI (`withProgress`) with cancellation support
- [ ] 3.4 Implement result summary UI (success/failed/skipped/cancelled) and optional copyable report

## 4. Error Handling
- [ ] 4.1 Implement `continueOnError` semantics (stop-fast vs best-effort)
- [ ] 4.2 Ensure safe handling for no-comment languages and unknown comment style (respect existing settings)

## 5. Tests
- [ ] 5.1 Add unit tests for filter rules and header detection edge cases
- [ ] 5.2 Add unit tests for concurrency limit behavior
- [ ] 5.3 Add integration tests for batch command happy path and cancellation

## 6. Docs
- [ ] 6.1 Update README with batch usage, configuration examples, and caveats

## 7. Validation
- [ ] 7.1 Run `pnpm run lint`
- [ ] 7.2 Run `pnpm test`
