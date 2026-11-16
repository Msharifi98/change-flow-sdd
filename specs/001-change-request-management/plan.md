# Implementation Plan: مدیریت درخواست‌های تغییر (ChangeFlow)

**Branch**: [001-change-request-management] | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from specs/001-change-request-management/spec.md

**Note**: This template is filled in by the $speckit-plan command; its definition describes the execution workflow.

## Summary

پیاده‌سازی یک HTTP API برای مدیریت درخواست‌های تغییر (Change Request Management) که کارمندان می‌توانند درخواست‌های تغییر (افزودن قابلیت، اصلاح فرایند، تغییر API) را ثبت کنند، بررسی شوند و تأیید شوند. سیستم باید تضمین کند که هیچ Requester نمی‌تواند درخواست خودش را تأیید کند (Self-approval ممنوع)، و عملیات تغییر وضعیت بر اساس هویت و مجوز فعلی انجام شود.

## Technical Context

**Language/Version**: Node.js 20.x + TypeScript 5.x

**Primary Dependencies**: Express, Prisma ORM, SQLite, zod (validation), ts-node

**Storage**: SQLite با Prisma ORM

**Testing**: Jest + Supertest

**Target Platform**: Linux server (Node.js runtime)

**Project Type**: web-api

**Performance Goals**: <200ms p95 for request endpoints,支持 1000 concurrent requests

**Constraints**: 
- HTTP API only (no CLI, no frontend)
- Mock authentication via X-User-Id header
- SQLite for development/production simplicity

**Scale/Scope**: Internal software company, moderate request volume

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Library-First
**Requirement**: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required.

**Status**: **PASS** — ChangeFlow is designed as a standalone HTTP API library with a clear purpose. It will be independently testable and documented.

### Gate 2: CLI Interface
**Requirement**: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats.

**Status**: **PASS (adapted)** — The constitution principle is adapted for HTTP API: every library exposes functionality via HTTP endpoints with JSON in/out protocol. This is the web equivalent of the CLI interface principle.

### Gate 3: Test-First (NON-NEGOTIABLE)
**Requirement**: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced.

**Status**: **PASS** — The plan mandates TDD approach. Tests will be written before implementation using Jest + Supertest.

### Gate 4: Integration Testing
**Requirement**: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas.

**Status**: **PASS** — Integration tests will cover HTTP API contracts and database schema.

### Gate 5: Observability, Versioning & Breaking Changes, Simplicity
**Requirement**: Text I/O ensures debuggability; Structured logging required; Versioning uses MAJOR.MINOR.BUILD; Start simple, YAGNI principles.

**Status**: **PASS** — Structured logging, MAJOR.MINOR.BUILD versioning, and YAGNI simplicity will be applied.

### Gate 6: Self-Approval (NON-NEGOTIABLE)
**Requirement**: Requester cannot approve their own request — even if they hold both roles.

**Status**: **PASS** — The spec explicitly prohibits self-approval (FR-007). This is enforced at the Service layer.


### Constitution Adaptation Note

**Principle II (CLI Interface)**: The constitution states "Every library exposes functionality via CLI; Text in/out protocol: stdin/args ? stdout, errors ? stderr". 

**Adaptation**: This feature is implemented as an HTTP API (Node.js + Express) rather than a CLI. This is a deliberate adaptation because:
1. The original scenario specifies an HTTP API requirement, not a CLI tool.
2. The JSON in/out protocol principle is preserved via HTTP JSON endpoints.
3. The text in/out protocol principle is preserved via HTTP request/response bodies.
4. All other constitution principles (Library-First, Test-First, Integration Testing, Observability, Self-Approval) are fully compliant.

This adaptation is documented here for governance traceability. The CLI Interface principle's intent (exposable interface with clear in/out protocol) is preserved through HTTP JSON API contracts.

## Project Structure

### Documentation (this feature)

`	ext
specs/001-change-request-management/
├── plan.md              # This file (-plan command output)
├── research.md          # Phase 0 output (-plan command)
├── data-model.md        # Phase 1 output (-plan command)
├── quickstart.md        # Phase 1 output (-plan command)
├── contracts/           # Phase 1 output (-plan command)
└── tasks.md             # Phase 2 output (-tasks command - NOT created by -plan)
`

### Source Code (repository root)

`	ext
src/
├── controllers/
│   ├── request.controller.ts
│   ├── user.controller.ts
│   └── index.ts
├── services/
│   ├── request.service.ts
│   ├── auth.service.ts
│   └── index.ts
├── repositories/
│   ├── request.repository.ts
│   ├── user.repository.ts
│   └── index.ts
├── models/
│   ├── ChangeRequest.ts
│   ├── User.ts
│   ├── Review.ts
│   └── index.ts
├── routes/
│   ├── requests.ts
│   └── index.ts
├── middleware/
│   ├── auth.middleware.ts
│   └── index.ts
├── dtos/
│   ├── CreateRequestDTO.ts
│   ├── SubmitRequestDTO.ts
│   ├── ApproveRequestDTO.ts
│   └── index.ts
├── errors/
│   ├── AppError.ts
│   └── index.ts
├── config/
│   └── database.ts (Prisma client)
├── index.ts
└── types.ts

tests/
├── integration/
│   ├── request.controller.integration.test.ts
│   └── auth.middleware.integration.test.ts
└── unit/
    ├── request.service.unit.test.ts
    └── request.repository.unit.test.ts

prisma/
└── schema.prisma
`

**Structure Decision**: Layered architecture (Controller → Service → Repository) selected. Controller handles only HTTP concerns (routing, validation, response), Service contains business logic, Repository handles data access. This separates concerns and makes each layer independently testable.

## Complexity Tracking

No violations of constitution gates identified. All gates pass with the current design. No complexity tracking needed.

---

## Phase 0: Outline & Research

All [NEEDS CLARIFICATION] markers in the spec have been resolved during the $speckit-clarify session. No unresolved ambiguities remain.

### Research Tasks

1. Research Prisma schema design for ChangeRequest, User, and Review entities with proper relationships.
2. Research Express middleware patterns for mock authentication via X-User-Id header.
3. Research layered architecture best practices for Node.js/TypeScript (Controller → Service → Repository).
4. Research concurrency control patterns for preventing lost updates in concurrent change request submissions with SQLite.

### Consolidated Findings (research.md)

Will be generated in research.md with:
- Decision: Storage approach chosen (SQLite + Prisma)
- Rationale: Why chosen over alternatives
- Alternatives considered: What else was evaluated
