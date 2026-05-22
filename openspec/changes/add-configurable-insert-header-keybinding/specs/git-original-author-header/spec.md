## ADDED Requirements

### Requirement: Provide default shortcut for inserting header
The system SHALL provide a default keyboard shortcut for command `git-original-author-header.insertGitOriginalHeader` in editable text editors.

#### Scenario: User uses default shortcut in editable editor
- **GIVEN** an editable file is focused in the VS Code editor
- **WHEN** the user presses the default shortcut
- **THEN** the system SHALL execute command `git-original-author-header.insertGitOriginalHeader`

#### Scenario: Shortcut does not trigger in read-only editors
- **GIVEN** a read-only editor is focused
- **WHEN** the user presses the default shortcut
- **THEN** the keybinding SHALL NOT execute the insert command

### Requirement: Provide default shortcut for updating Last metadata
The system SHALL provide a default keyboard shortcut for command `git-original-author-header.updateHeaderLastEditMeta` in editable text editors.

#### Scenario: User uses default shortcut for update command in editable editor
- **GIVEN** an editable file is focused in the VS Code editor
- **WHEN** the user presses the default shortcut for update command
- **THEN** the system SHALL execute command `git-original-author-header.updateHeaderLastEditMeta`

#### Scenario: Update shortcut does not trigger in read-only editors
- **GIVEN** a read-only editor is focused
- **WHEN** the user presses the default shortcut for update command
- **THEN** the keybinding SHALL NOT execute the update command

### Requirement: Allow users to customize shortcut
The system SHALL allow users to override the default shortcut using VS Code keybinding customization.

#### Scenario: User overrides shortcut in keybindings
- **GIVEN** the user has assigned a custom keybinding for `git-original-author-header.insertGitOriginalHeader`
- **WHEN** the user presses the custom shortcut
- **THEN** VS Code SHALL execute the command with the user-defined shortcut
- **AND** the extension SHALL continue to support that customization without additional settings

#### Scenario: User overrides update command shortcut in keybindings
- **GIVEN** the user has assigned a custom keybinding for `git-original-author-header.updateHeaderLastEditMeta`
- **WHEN** the user presses the custom shortcut
- **THEN** VS Code SHALL execute the update command with the user-defined shortcut
- **AND** the extension SHALL continue to support that customization without additional settings
