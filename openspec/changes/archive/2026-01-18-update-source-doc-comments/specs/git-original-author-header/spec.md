## ADDED Requirements

### Requirement: Core source files include maintainable documentation
The system SHALL keep core source files documented with concise file descriptions and accurate function-level JSDoc to support safe maintenance without changing runtime behavior.

#### Scenario: Repository maintainer reviews core sources
- **GIVEN** the repository contains the core files `src/extension.ts`, `src/header.ts`, `src/commentStyle.ts`, `src/dateTime.ts`, `src/author.ts`
- **WHEN** a maintainer opens each file for review
- **THEN** the file header `@Description` is present and concisely describes the file responsibility
- **AND** each exported function has JSDoc covering intent, parameters, return value, and fallback/edge behaviors

### Requirement: Comments stay lightweight inside function bodies
The system SHALL keep function-body inline comments minimal, adding them only where complexity or non-obvious rules exist.

#### Scenario: Maintainer scans implementation for noise
- **GIVEN** the maintainer is reading the implementation of core functions
- **WHEN** the function body is scanned
- **THEN** inline comments are limited to complex areas (e.g., Git command escaping, timestamp fallback rules)
- **AND** simple statements do not receive redundant commentary
