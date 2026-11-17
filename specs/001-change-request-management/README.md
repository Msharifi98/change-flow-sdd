# ChangeFlow - Change Request Management System

?? HTTP API ???? ?????? ??????????? ????? ?? ?? ???? ????????? ?????. ?? Node.js, TypeScript, Express, ? Prisma ORM (SQLite) ????? ??? ???.

## Architecture

architecture ???????:

- **Controller**: ?????????? HTTP (routing, validation, response)

- **Service**: ???? ???????? (??????? ?????? ????????? ????? ??????)

- **Repository**: ?????? ?? ??????? (Prisma ORM)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/requests | Create a new change request (DRAFT) |
| POST | /api/requests/:id/submit | Submit a DRAFT request for review |
| POST | /api/requests/:id/review | Review a PENDING_REVIEW request |
| GET | /api/requests/:id | Get request details with reviews |
| GET | /api/requests | List requests with optional filters |

## Authentication

????? ???? simulated ?? ??? X-User-Id. ??? ??? ????? ????? ?? ?? ?? ??????? ????? ??????.

## Key Features

- Create change requests with title, description, and reason

- Submit requests for review (DRAFT ? PENDING_REVIEW)

- Review requests: approve or request changes

- Self-approval prevention (requester cannot approve their own request)

- Role-based access control (Requester vs Reviewer)

- Optimistic locking for concurrency control (version column)

- Status transition validation

## Status Transitions

- Draft ? PendingReview (submit)

- PendingReview ? Approved (reviewer approves)

- PendingReview ? ChangesRequested (reviewer requests changes)

- ChangesRequested ? PendingReview (requester resubmits)

- Approved: final state (not editable)

## Setup

ash
npm install
npx prisma migrate dev
npm start
"
Add-Content -Path 'specs/001-change-request-management/README.md' -Value "
Add-Content -Path 'specs/001-change-request-management/README.md' -Value 

ash
npm test
"
Add-Content -Path 'specs/001-change-request-management/README.md' -Value "
Add-Content -Path 'specs/001-change-request-management/README.md' -Value 

See specs/001-change-request-management/quickstart.md for end-to-end validation scenarios.
