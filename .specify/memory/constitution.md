<!-- Sync Impact Report
Version change: — → 1.0.0 (initial constitution)
Modified principles: none
Added sections: Core Principles (five principles), Additional Constraints, Development Workflow and Quality Gates, Governance
Removed sections: none
Follow-up TODOs: none
-->

# Practics 01 Constitution

## Core Principles

### I. Library-First
Every feature starts as a standalone library. Libraries must be self-contained, independently testable, and documented. A clear purpose is required; no organizational-only libraries are permitted.

### II. CLI Interface
Every library exposes functionality via a CLI. The text in/out protocol uses stdin/args to stdout and errors to stderr. Libraries support both JSON and human-readable formats.

### III. Test-First (NON-NEGOTIABLE)
TDD is mandatory. The cycle is: tests written, user approved, tests fail, then implement. The red-green-refactor cycle is strictly enforced.

### IV. Integration Testing
Integration tests are required for new library contracts, contract changes, inter-service communication, and shared schemas.

### V. Observability, Versioning and Breaking Changes, Simplicity
Text I/O ensures debuggability. Structured logging is required. Versioning uses MAJOR.MINOR.BUILD. Start simple and apply YAGNI principles.

## Additional Constraints

Technology stack requirements, compliance standards, and deployment policies apply to all work. All code must follow the project linting, formatting, and type-checking standards.

## Development Workflow and Quality Gates

Code review requirements, testing gates, and the deployment approval process apply to all changes. Every change requires review and must pass the full test suite before merging.

## Governance

This constitution supersedes all other practices. Amendments require documentation, approval, and a migration plan.

Constitution versions follow semantic versioning. MAJOR is for backward-incompatible principle removals or redefinitions. MINOR is for new principles or materially expanded guidance. PATCH is for clarifications, wording fixes, and non-semantic refinements.

All PRs and reviews must verify compliance with this constitution. Complexity must be justified. This constitution serves as the runtime development guidance for the project.

**Version**: 1.0.0 | **Ratified**: 2026-11-16 | **Last Amended**: 2026-11-16
