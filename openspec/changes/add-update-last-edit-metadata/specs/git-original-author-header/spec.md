## ADDED Requirements

### Requirement: Provide single-file update for Last edit metadata
The system SHALL provide a command to update only `@LastEditors` and `@LastEditTime` in an existing extension header for the active file.

#### Scenario: Active file contains extension header
- **GIVEN** the active file contains an extension header in the inspected head region
- **WHEN** the user runs the single-file update command
- **THEN** the system SHALL update `@LastEditors` using current `git config user.name` fallback semantics
- **AND** the system SHALL update `@LastEditTime` to current local time (`YYYY-MM-DD HH:mm:ss`)
- **AND** the system SHALL keep `@Author`, `@Date`, `@FilePath`, and `@Description` unchanged

#### Scenario: Active file does not contain extension header
- **GIVEN** the active file does not contain an extension header
- **WHEN** the user runs the single-file update command
- **THEN** the system SHALL not modify the file
- **AND** the system SHALL show a skip message

### Requirement: Provide folder batch update for Last edit metadata
The system SHALL provide a command to batch-update `@LastEditors` and `@LastEditTime` for files that already contain an extension header under a selected folder.

#### Scenario: Batch update runs on folder with mixed files
- **GIVEN** the target folder contains files with and without extension headers
- **WHEN** the user confirms batch update
- **THEN** the system SHALL update only files that contain extension headers
- **AND** files without extension headers SHALL be skipped

#### Scenario: Batch update supports cancellation and summary
- **GIVEN** batch update is running with progress UI
- **WHEN** the user cancels processing
- **THEN** the system SHALL stop processing additional files
- **AND** the system SHALL present a summary/report for completed work

### Requirement: Preserve header structure when updating Last fields
The system SHALL preserve comment style and line prefixes while updating Last edit metadata.

#### Scenario: C block header update keeps block wrapper and prefixes
- **GIVEN** the file header uses `/* ... */` and lines are prefixed with ` * `
- **WHEN** Last fields are updated
- **THEN** only the values of `@LastEditors` and `@LastEditTime` SHALL change
- **AND** all non-target lines and wrappers SHALL remain unchanged

#### Scenario: Hash line header update keeps line-comment style
- **GIVEN** the file header uses `# ` per-line comment style
- **WHEN** Last fields are updated
- **THEN** only the values of `@LastEditors` and `@LastEditTime` SHALL change
- **AND** line prefixes and line order SHALL remain unchanged

### Requirement: Optional auto refresh on save
The system SHALL provide an optional setting to auto-refresh `@LastEditors` and `@LastEditTime` when a file is being saved.

#### Scenario: Setting is disabled by default
- **GIVEN** the user has not configured the auto refresh setting
- **WHEN** a file is saved
- **THEN** the system SHALL NOT auto-update Last edit metadata

#### Scenario: Enabled setting updates Last fields during save
- **GIVEN** `git-original-author-header.autoUpdateLastEditOnSave=true`
- **AND** the file contains an extension header with Last fields
- **WHEN** the file is saved
- **THEN** the system SHALL update `@LastEditors` and `@LastEditTime`
- **AND** the save operation SHALL persist the updated values

#### Scenario: Enabled setting skips files without valid extension header
- **GIVEN** `git-original-author-header.autoUpdateLastEditOnSave=true`
- **AND** the file does not contain a valid extension header or lacks Last fields
- **WHEN** the file is saved
- **THEN** the system SHALL NOT modify the file content
