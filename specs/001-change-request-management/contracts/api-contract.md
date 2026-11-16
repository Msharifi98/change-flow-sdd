# API Contract: مدیریت درخواست‌های تغییر (ChangeFlow)

ChangeFlow یک HTTP API است که بر اساس اصول قانون fundamental (Library-First، نسخه‌سازی، simplify) طراحی شده است. هر نقطه پایانی (endpoint) پاسخ JSON می‌دهد.

## Authentication (Mock)

احراز هویت با هدر X-User-Id انجام می‌شود. این هدر شناسه کاربر را در هر درخواست ارسال می‌کند. سیستم نقش کاربر را از پایگاه داده می‌خواند و بر اساس آن دسترسی را تعیین می‌کند.

- **Header**: X-User-Id: <user-uuid>
- اگر هدر غائب باشد، پاسخ 401 Unauthorized برمی‌گردد.
- Self-approval prevention: اگر requester_id == reviewer_id (یعنی کاربر سعی کند درخواست خودش را تأیید کند)، پاسخ 403 Forbidden برمی‌گردد.

## API Endpoints

### 1. POST /api/requests
ثبت یک درخواست تغییر جدید در وضعیت Draft.

**Request Body**:
`json
{
  "title": "string (required)",
  "description": "string (required)",
  "reason": "string (required)"
}
`

**Response (201 Created)**:
`json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "reason": "string",
  "requesterId": "uuid",
  "status": "DRAFT",
  "version": 1,
  "createdAt": "ISO date string"
}
`

**Errors**:
- 400 Bad Request: فیلدهای الزامی غائب هستند یا نامعتبر هستند.
- 401 Unauthorized: هدر X-User-Id غائب است.

### 2. POST /api/requests/:id/submit
ارسال یک درخواست در وضعیت Draft برای بررسی (تغییر وضعیت به PendingReview). فقط Requester می‌تواند این عملیات را انجام دهد.

**Response (200 OK)**:
`json
{
  "id": "uuid",
  "status": "PENDING_REVIEW",
  "version": 2
}
`

**Errors**:
- 400 Bad Request: وضعیت درخواست دRAFT نیست.
- 403 Forbidden: کاربر درخواست را ثبت نکرده است (نخوانی requester_id).
- 404 Not Found: درخواست پیدا نشد.

### 3. POST /api/requests/:id/review
بررسی یک درخواست در وضعیت PendingReview. فقط Reviewer می‌تواند این عملیات را انجام دهد.

**Request Body** (یکی از دو گزینه):
`json
// تأیید
{
  "decision": "APPROVE"
}

// درخواست تغییرات
{
  "decision": "REQUEST_CHANGES",
  "comments": "string (required for REQUEST_CHANGES)"
}
`

**Response (200 OK)**:
`json
// تأیید
{
  "id": "uuid",
  "status": "APPROVED",
  "version": 3
}
// درخواست تغییرات
{
  "id": "uuid",
  "status": "CHANGES_REQUESTED",
  "version": 3
}
`

**Errors**:
- 400 Bad Request: وضعیت PendingReview نیست یا comments غائب است برای REQUEST_CHANGES.
- 403 Forbidden: کاربر نقش Reviewer ندارد یا سعی می‌کند درخواست خودش را تأیید کند (self-approval).
- 404 Not Found: درخواست پیدا نشد.

### 4. POST /api/requests/:id/submit (after changes requested)
ارسال یک درخواست در وضعیت ChangesRequested برای بررسی مجدد (تغییر وضعیت به PendingReview). فقط Requester می‌تواند این عملیات را انجام دهد.

**Response (200 OK)**:
`json
{
  "id": "uuid",
  "status": "PENDING_REVIEW",
  "version": 4
}
`

**Errors**:
- 400 Bad Request: وضعیت ChangesRequested نیست.
- 403 Forbidden: کاربر درخواست را ثبت نکرده است.
- 404 Not Found: درخواست پیدا نشد.

### 5. GET /api/requests
فهرست درخواست‌ها با فیلتر اختیاری.

**Query Parameters**:
- status (optional): فیلتر بر اساس وضعیت (DRAFT, PENDING_REVIEW, APPROVED, CHANGES_REQUESTED)
- equesterId (optional): فیلتر بر اساس شناسه ثبت‌کننده

**Response (200 OK)**:
`json
[
  {
    "id": "uuid",
    "title": "string",
    "status": "string",
    "requesterId": "uuid",
    "createdAt": "ISO date string"
  }
]
`

**Errors**:
- 401 Unauthorized: هدر X-User-Id غائب است.

### 6. GET /api/requests/:id
نمایش جزئیات یک درخواست.

**Response (200 OK)**:
`json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "reason": "string",
  "requesterId": "uuid",
  "status": "string",
  "version": 1,
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string",
  "reviews": [
    {
      "id": "uuid",
      "reviewerId": "uuid",
      "decision": "APPROVE | REQUEST_CHANGES",
      "comments": "string | null",
      "createdAt": "ISO date string"
    }
  ]
}
`

**Errors**:
- 404 Not Found: درخواست پیدا نشد.

## Error Response Format

همه خطاها در این فرمت برمی‌گردند:
`json
{
  "error": "string",
  "message": "string",
  "statusCode": 400
}
`

## Validation Rules

- 	itle, description, eason الزامی برای POST /api/requests هستند.
- decision الزامی برای POST /api/requests/:id/review است و باید APPROVE یا REQUEST_CHANGES باشد.
- comments الزامی است وقتی decision برابر REQUEST_CHANGES باشد.
- Self-approval: اگر reviewerId == requesterId، پاسخ 403 Forbidden برمی‌گردد.
- فقط Requester می‌تواند submit را انجام دهد (PUT/POST submit).
- فقط Reviewer می‌تواند review را انجام دهد.
- درخواست در وضعیت APPROVED قابل ویرایش نیست.

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (missing X-User-Id) |
| 403 | Forbidden (insufficient permissions or self-approval) |
| 404 | Not Found |
| 409 | Conflict (concurrency/version mismatch) |
| 500 | Internal Server Error |
