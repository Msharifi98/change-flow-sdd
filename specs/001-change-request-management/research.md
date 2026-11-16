# Research: مدیریت درخواست‌های تغییر (ChangeFlow)

## Decisions

### Decision 1: Technology Stack
**Decision**: Node.js 20.x + Express + TypeScript + Prisma ORM + SQLite

**Rationale**:
- TypeScript provides type safety for the layered architecture (Controller -> Service -> Repository).
- Express is a minimal, well-understood web framework for building HTTP APIs.
- Prisma ORM provides type-safe database access with SQLite support.
- SQLite is zero-configuration, ideal for a single-file database in an internal company tool.

**Alternatives considered**:
- Python/FastAPI: Rejected because the team is more familiar with TypeScript/Node.js.
- Go/Gin: Rejected due to lack of team expertise.
- PostgreSQL: Rejected because SQLite is sufficient for the expected scale and simplifies deployment.

### Decision 2: Architecture Pattern
**Decision**: Layered architecture (Controller -> Service -> Repository)

**Rationale**:
- Separation of concerns: Controller handles only HTTP (routing, validation, response), Service contains business logic, Repository handles data access.
- Each layer is independently testable (unit tests for Service and Repository, integration tests for Controller).
- Aligns with the constitution's Library-First principle — each layer is a self-contained, independently testable module.

### Decision 3: Authentication
**Decision**: Mock authentication via X-User-Id header

**Rationale**:
- The spec does not specify a real authentication system.
- Using a simple header-based mock allows the feature to be developed and tested without integrating a full auth system.
- The X-User-Id header provides the user identity needed for self-approval prevention and role-based access control.

**Alternatives considered**:
- JWT tokens: Rejected as over-engineering for this scope.
- Session-based auth: Rejected due to additional infrastructure requirements.

### Decision 4: Database Schema
**Decision**: Prisma schema with SQLite

**Rationale**:
- Prisma provides type-safe database access with automatic type generation from the schema.
- SQLite is file-based, zero-configuration, and suitable for the expected scale.
- Relationships (foreign keys) are explicitly defined for referential integrity.

**Schema**:
prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  role      UserRole
  createdAt DateTime @default(now())
}

enum UserRole {
  REQUESTER
  REVIEWER
}

model ChangeRequest {
  id          String   @id @default(cuid())
  title       String
  description String
  reason      String
  requesterId String
  status      RequestStatus @default(DRAFT)
  version     Int        @default(1)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  requester   User       @relation(fields: [requesterId], references: [id])
  reviews     Review[]   @relation("reviews", forDelete: cascade)
}

enum RequestStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  CHANGES_REQUESTED
}

model Review {
  id            String   @id @default(cuid())
  changeRequestId String
  reviewerId    String
  decision      ReviewDecision
  comments      String?
  createdAt     DateTime @default(now())

  changeRequest ChangeRequest @relation(fields: [changeRequestId], references: [id])
  reviewer      User          @relation(fields: [reviewerId], references: [id])

  @@unique([changeRequestId, reviewerId])
}

enum ReviewDecision {
  APPROVE
  REQUEST_CHANGES
}

### Decision 5: Concurrency Control
**Decision**: Optimistic locking with version column on ChangeRequest

**Rationale**:
- The spec explicitly requires preventing lost updates from concurrent change requests.
- The version column (starting at 1, incremented on each update) enables optimistic locking.
- When updating, the service checks that the version hasn't changed since it was read.

### Decision 6: API Design
**Decision**: RESTful HTTP API with JSON in/out

**Rationale**:
- RESTful design with standard HTTP methods and status codes.
- JSON for both request and response bodies.
- Aligns with the constitution's CLI Interface principle (adapted for HTTP): text/protocol in/out via JSON.

## Open Questions (to be resolved in Phase 2/tasks)

- Exact Express middleware implementation for auth
- Error handling strategy (custom error classes vs. middleware)
- API versioning strategy (URL prefix vs. header)
