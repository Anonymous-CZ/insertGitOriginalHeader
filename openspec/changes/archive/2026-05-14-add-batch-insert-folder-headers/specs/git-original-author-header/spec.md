## ADDED Requirements

### Requirement: Provide a folder batch command
The system SHALL provide a command to batch-insert the Git original author header for files under a selected folder.

#### Scenario: User runs the command from Explorer folder context menu
- **GIVEN** the user right-clicks a folder in the VS Code Explorer
- **WHEN** the user selects "批量补充文件头注释"
- **THEN** the system SHALL use that folder as the batch target

#### Scenario: User runs the command from Command Palette
- **GIVEN** the user runs the command from the Command Palette
- **WHEN** the system prompts the user to choose a target folder and the user confirms
- **THEN** the system SHALL use the chosen folder as the batch target

### Requirement: Scan recursively and filter candidates
The system SHALL recursively scan all files under the target folder and filter which files are eligible for processing.

Eligibility rules:
- The system SHALL exclude files matching `git-original-author-header.batchExcludePatterns`.
- When `git-original-author-header.batchIncludeExtensions` is non-empty, the system SHALL only include files whose extension matches the allowlist.
- When `git-original-author-header.skipBinaryFiles=true`, the system SHALL skip binary files.

#### Scenario: Default excludes prevent dependency/build folders from being scanned
- **GIVEN** the target folder contains `node_modules/` or `dist/`
- **WHEN** the batch scan runs
- **THEN** files inside those folders SHALL be excluded by default

#### Scenario: User excludes files via glob patterns
- **GIVEN** the user configures `git-original-author-header.batchExcludePatterns` to include `**/*.min.js`
- **WHEN** the batch scan runs
- **THEN** files matching `**/*.min.js` SHALL be excluded

### Requirement: Detect existing headers and skip insertion
The system SHALL detect whether a file already contains a header inserted by this extension and SHALL skip insertion when a header is already present.

Detection rules:
- The system SHALL only inspect the first `git-original-author-header.commentCheckLines` lines of the file.
- The system SHALL treat a header as present when the inspected content contains all of `@Author`, `@Date`, and `@FilePath`.

#### Scenario: File already contains the extension header
- **GIVEN** a file begins with a comment block containing `@Author`, `@Date`, and `@FilePath`
- **WHEN** the batch command runs
- **THEN** the system SHALL not modify that file
- **AND** the file SHALL be counted as skipped (already has header)

### Requirement: Respect existing single-file semantics
For each file that is eligible and missing a header, the system SHALL apply the same header generation rules as the existing single-file insertion command.

#### Scenario: Batch insertion uses the same author/date/path rules
- **GIVEN** a file is missing a header and is eligible for insertion
- **WHEN** the system inserts a header via the batch command
- **THEN** `@Author`, `@Date`, `@LastEditors`, `@LastEditTime`, and `@FilePath` SHALL follow the same semantics as the single-file command

### Requirement: Confirm before writing changes
After scanning, the system SHALL present a confirmation prompt summarizing the scan results before performing edits.

The summary SHALL include:
- Total files scanned
- Total eligible files
- Total files missing headers (planned to edit)

#### Scenario: User cancels after scan
- **GIVEN** the scan summary is displayed
- **WHEN** the user chooses Cancel
- **THEN** the system SHALL not modify any files

### Requirement: Show progress and support cancellation
During batch processing, the system SHALL show progress and SHALL support user cancellation.

#### Scenario: User cancels while processing
- **GIVEN** batch processing is in progress
- **WHEN** the user cancels
- **THEN** the system SHALL stop processing additional files
- **AND** the system SHALL present a result summary for work completed so far

### Requirement: Limit concurrency
The system SHALL limit the maximum number of concurrently processed files to `git-original-author-header.batchConcurrency`.

#### Scenario: Concurrency is capped
- **GIVEN** `git-original-author-header.batchConcurrency` is set to 3
- **WHEN** the batch command processes 100 files
- **THEN** no more than 3 files SHALL be processed concurrently

### Requirement: Error handling policy
The system SHALL apply an error handling policy controlled by `git-original-author-header.continueOnError`.

#### Scenario: Stop on first error
- **GIVEN** `git-original-author-header.continueOnError=false`
- **AND** an error occurs while processing a file
- **WHEN** the batch command is running
- **THEN** the system SHALL stop processing remaining files
- **AND** the system SHALL present a result summary including the failure

#### Scenario: Continue on errors
- **GIVEN** `git-original-author-header.continueOnError=true`
- **AND** an error occurs while processing a file
- **WHEN** the batch command is running
- **THEN** the system SHALL continue processing subsequent files
- **AND** the system SHALL present a result summary including the failures

### Requirement: Result summary and optional report
After the batch command completes (successfully, partially, or cancelled), the system SHALL display a result summary.

When `git-original-author-header.generateReport=true`, the system SHALL generate a plain-text report that includes:
- counts (success/failed/skipped)
- list of files per outcome category (at least failed)

#### Scenario: Report is generated when enabled
- **GIVEN** `git-original-author-header.generateReport=true`
- **WHEN** the batch command completes
- **THEN** the system SHALL generate a report for the run
