# Tasks: مدیریت درخواست‌های تغییر (ChangeFlow)

**Input**: Design documents from specs/001-change-request-management/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: [ID] [P?] [Story] Description

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: src/, 	ests/ at repository root
- Paths shown below assume single project - adjust based on plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan in src/, 	ests/, prisma/
- [x] T002 Initialize Node.js project with TypeScript and Express dependencies in ./package.json
- [x] T003 [P] Configure Prisma ORM with SQLite in prisma/schema.prisma
- [x] T004 [P] Configure linting (ESLint) and formatting (Prettier) tools in ./.eslintrc.js, ./.prettierrc
- [x] T005 [P] Configure Jest and Supertest testing framework in ./jest.config.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Setup database schema and migrations with Prisma in prisma/schema.prisma (User, ChangeRequest, Review entities)  [FR-010]  [SC-005]
- [x] T007 [P] Implement authentication middleware in src/middleware/auth.middleware.ts (X-User-Id header validation)  [FR-009]
- [x] T008 [P] Setup API routing and middleware structure in src/routes/index.ts, src/middleware/
- [x] T009 [P] Create base models/entities that all stories depend on in src/models/ChangeRequest.ts, src/models/User.ts, src/models/Review.ts
- [x] T010 [P] Configure error handling and logging infrastructure in src/errors/AppError.ts, src/config/logger.ts
- [x] T011 [P] Setup environment configuration management in src/config/database.ts (Prisma client)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - ثبت درخواست تغییر جدید در وضعیت Draft (Priority: P1) 🎯 MVP

**Goal**: Requester can create a new change request with title, description, reason, and requester ID. Request is saved in DRAFT status and is editable by the Requester.

**Independent Test**: A Requester can submit a complete change request via POST /api/requests and receive a 201 Created response with the request in DRAFT status. The request can be retrieved via GET /api/requests/:id.

### Tests for User Story 1 (OPTIONAL - only if tests requested)

- [x] T012 [P] [US1] Contract test for POST /api/requests in 	ests/contract/test-requests.contract.test.ts  [SC-001]
- [x] T013 [P] [US1] Integration test for create request flow in 	ests/integration/test-requests.integration.test.ts  [SC-001]

### Implementation for User Story 1

- [x] T014 [P] [US1] Create ChangeRequest model in src/models/ChangeRequest.ts (fields: id, title, description, reason, requesterId, status, version, createdAt, updatedAt)  [FR-001]
- [x] T015 [P] [US1] Create User model in src/models/User.ts (fields: id, username, role, createdAt)  [FR-001]
- [x] T016 [P] [US1] Create Review model in src/models/Review.ts (fields: id, changeRequestId, reviewerId, decision, comments, createdAt)  [FR-001]
- [x] T017 [US1] Implement RequestService in src/services/request.service.ts (depends on T014, T015, T016) - create request method with validation  [FR-001, FR-002, FR-009]  [SC-001]
- [x] T018 [US1] Implement RequestController in src/controllers/request.controller.ts - POST /api/requests endpoint  [FR-001, FR-002]  [SC-001]
- [x] T019 [US1] Create CreateRequestDTO in src/dtos/CreateRequestDTO.ts with validation rules (title, description, reason required)  [FR-001]
- [x] T020 [US1] Register POST /api/requests route in src/routes/requests.ts  [FR-001, FR-002]
- [x] T021 [US1] Add error handling for validation failures (400 Bad Request) and missing auth (401 Unauthorized) in src/errors/AppError.ts  [FR-001]
- [x] T022 [US1] Add logging for request creation operations in src/config/logger.ts  [FR-001]

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - ارسال درخواست برای بررسی (Priority: P2)

**Goal**: Requester can submit a DRAFT request for review, transitioning status to PENDING_REVIEW. Only the Requester who created the request can submit it.

**Independent Test**: A Requester can submit their own DRAFT request via POST /api/requests/:id/submit and receive a 200 OK response with status PENDING_REVIEW. A non-Requester user receives 403 Forbidden.

### Tests for User Story 2 (OPTIONAL - only if tests requested)

- [x] T023 [P] [US2] Contract test for POST /api/requests/:id/submit in 	ests/contract/test-requests.contract.test.ts
- [x] T024 [P] [US2] Integration test for submit request flow in 	ests/integration/test-requests.integration.test.ts

### Implementation for User Story 2

- [x] T025 [P] [US2] Add submitRequest method to RequestService in src/services/request.service.ts (depends on T017) - validates requester ownership and DRAFT status  [FR-003, FR-006]  [SC-004]
- [x] T026 [US2] Add submit endpoint to RequestController in src/controllers/request.controller.ts - POST /api/requests/:id/submit  [FR-003, FR-006]  [SC-004]
- [x] T027 [US2] Create SubmitRequestDTO in src/dtos/SubmitRequestDTO.ts (no body needed, just params)  [FR-003]
- [x] T028 [US2] Register POST /api/requests/:id/submit route in src/routes/requests.ts  [FR-003, FR-006]
- [x] T029 [US2] Add validation: request must be in DRAFT status (400 Bad Request if not) in src/services/request.service.ts  [FR-003]
- [x] T030 [US2] Add authorization check: only requester can submit (403 Forbidden if not) in src/services/request.service.ts  [FR-003]

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - بررسی و تأیید/برگشت درخواست توسط Reviewer (Priority: P3)

**Goal**: Reviewer can review a PENDING_REVIEW request and either approve (APPROVED) or request changes (CHANGES_REQUESTED). Self-approval is prohibited. Reviewer can only review requests they are authorized for.

**Independent Test**: A Reviewer can approve a PENDING_REVIEW request via POST /api/requests/:id/review with decision APPROVE and receive 200 OK with status APPROVED. A Requester trying to approve their own request receives 403 Forbidden.

### Tests for User Story 3 (OPTIONAL - only if tests requested)

- [x] T031 [P] [US3] Contract test for POST /api/requests/:id/review in 	ests/contract/test-requests.contract.test.ts
- [x] T032 [P] [US3] Integration test for review flow (approve and request-changes) in 	ests/integration/test-requests.integration.test.ts

### Implementation for User Story 3

- [x] T033 [P] [US3] Add reviewRequest method to RequestService in src/services/request.service.ts (depends on T017) - validates self-approval prevention, role-based access, and status transitions  [FR-004, FR-005, FR-008, FR-009]
- [x] T034 [US3] Add review endpoint to RequestController in src/controllers/request.controller.ts - POST /api/requests/:id/review  [FR-004, FR-005, FR-008]
- [x] T035 [US3] Create ReviewRequestDTO in src/dtos/ReviewRequestDTO.ts with validation (decision: APPROVE or REQUEST_CHANGES, comments required for REQUEST_CHANGES)  [FR-004, FR-005]
- [x] T036 [US3] Register POST /api/requests/:id/review route in src/routes/requests.ts  [FR-004, FR-005]
- [x] T037 [US3] Add self-approval prevention: if reviewerId == requesterId, return 403 Forbidden in src/services/request.service.ts  [FR-007]  [SC-002, SC-003]
- [x] T038 [US3] Add role-based access: only users with REVIEWER role can review (403 Forbidden otherwise) in src/services/request.service.ts  [FR-007]  [SC-002]
- [x] T039 [US3] Add validation: REQUEST_CHANGES requires comments (400 Bad Request if missing) in src/services/request.service.ts  [FR-005]
- [x] T040 [US3] Add status transition validation: only PENDING_REVIEW can be reviewed (400 Bad Request otherwise) in src/services/request.service.ts  [FR-010, FR-004]  [SC-004, SC-005]

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: List and Get Requests (Cross-cutting)

**Goal**: Support listing requests with filters and retrieving individual request details with reviews.

**Independent Test**: GET /api/requests returns list of requests with optional status/requesterId filters. GET /api/requests/:id returns full request details including reviews.

### Implementation for Phase 6

- [x] T041 [P] Add getRequest method to RequestService in src/services/request.service.ts  [FR-001]
- [x] T042 Add listRequests method to RequestService in src/services/request.service.ts (with optional filters)  [FR-001]
- [x] T043 [P] Add GET /api/requests/:id endpoint to RequestController in src/controllers/request.controller.ts  [FR-001]
- [x] T044 Add GET /api/requests endpoint to RequestController in src/controllers/request.controller.ts  [FR-001]
- [x] T045 [P] Register GET routes in src/routes/requests.ts  [FR-001]
- [x] T046 [P] Add response DTOs in src/dtos/ResponseDTOs.ts  [FR-001]

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T047 [P] Documentation updates in ./README.md
- [x] T048 [P] Code cleanup and refactoring across all layers in src/
- [x] T049 [P] Performance optimization across all stories in src/
- [x] T050 [P] Additional unit tests in 	ests/unit/
- [x] T051 [P] Security hardening (input validation, rate limiting) in src/middleware/
- [x] T052 [P] Run quickstart.md validation scenarios (SC-001, SC-002, SC-003, SC-004, SC-005 acceptance validation) in specs/001-change-request-management/quickstart.md  [SC-001, SC-002, SC-003, SC-004, SC-005]

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on User Story 1 (request must exist in DRAFT to submit)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on User Story 2 (request must be in PENDING_REVIEW to review)

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- User Story 1 models (T014, T015, T016) can run in parallel  [FR-001]
- User Story 2 service/controller tasks can run after models are complete

---

## Parallel Example: User Story 1

`ash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for POST /api/requests in tests/contract/test-requests.contract.test.ts"
Task: "Integration test for create request flow in tests/integration/test-requests.integration.test.ts"

# Launch all models for User Story 1 together:
Task: "Create ChangeRequest model in src/models/ChangeRequest.ts"
Task: "Create User model in src/models/User.ts"
Task: "Create Review model in src/models/Review.ts"
`

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready (MVP: create request in DRAFT status)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (create request)
   - Developer B: User Story 2 (submit for review)
   - Developer C: User Story 3 (review/approve)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
\n\n## Phase 8: Convergence\n\n**Purpose**: Close remaining gaps between the implemented code and the spec/plan/constitution.
\n- [ ] T053 [HIGH] Implement UserController and POST /api/users route in src/controllers/user.controller.ts and src/routes/users.ts - required by quickstart scenarios to create users before testing [FR-009, SC-001] (missing)
\n- [ ] T054 [HIGH] Integrate logger into application - import and use logger in controllers and services for structured logging [Constitution V] (missing)
\n- [ ] T055 [HIGH] Fix auth middleware to look up user role from database instead of hardcoding 'REQUESTER' - role-based access control is currently broken [FR-009] (partial)
\n- [ ] T056 [HIGH] Fix optimistic locking to catch Prisma P2011 error on version mismatch and return 409 Conflict instead of 500 [FR-010, SC-005] (partial)
\n- [ ] T057 [MEDIUM] Add global error handling middleware in src/middleware/error.middleware.ts - centralized error handling instead of ad-hoc per-controller [plan] (partial)
\n- [ ] T058 [MEDIUM] Add explicit guard for FR-008 - prevent any edits to APPROVED requests with clear 400 error [FR-008] (partial)
