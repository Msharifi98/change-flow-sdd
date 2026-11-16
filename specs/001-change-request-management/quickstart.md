# Quickstart: مدیریت درخواست‌های تغییر (ChangeFlow)

این راهنما validates scenarios برای اثبات کارکرد end-to-end ویژگی مدیریت درخواست تغییر از طریق HTTP API.

## Prerequisites

- یک پایگاه داده SQLite با اجرای migration Prisma
- سرور Node.js/Express در اجرا (npm start)
- ابزار curl یا HTTP client برای ارسال درخواست‌ها

## Setup Commands

bash
# ۱. راه‌اندازی پایگاه داده
npx prisma migrate deploy

# ۲. راه‌اندازی سرور
npm start

# ۳. ایجاد کاربر با نقش Requester
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"alice\", \"role\": \"REQUESTER\"}"

# ۴. ایجاد کاربر با نقش Reviewer
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"bob\", \"role\": \"REVIEWER\"}"

## Validation Scenarios

### Scenario 1: ثبت درخواست تغییر در وضعیت Draft و ارسال برای بررسی

**Prerequisites**: کاربر Requester (alice) noho created است.

**Steps**:
1. curl -X POST http://localhost:3000/api/requests \
   -H "X-User-Id: alice-uuid" \
   -H "Content-Type: application/json" \
   -d "{\"title\": \"Add user authentication\", \"description\": \"Implement OAuth2 login\", \"reason\": \"Security requirement\"}"
2. بررسی خروجی: وضعیت DRAFT، شناسه UUID تولید شده در پاسخ
3. curl -X POST http://localhost:3000/api/requests/{uuid}/submit \
   -H "X-User-Id: alice-uuid" \
   -H "Content-Type: application/json"
4. بررسی خروجی: وضعیت PENDING_REVIEW

**Expected Outcome**: درخواست در وضعیت DRAFT ذخیره شده، سپس به PENDING_REVIEW تبدیل می‌شود.

### Scenario 2: بررسی و تأیید درخواست توسط Reviewer

**Prerequisites**: درخواستی در وضعیت PENDING_REVIEW، کاربر Reviewer (bob) noho created است.

**Steps**:
1. curl -X POST http://localhost:3000/api/requests/{uuid}/review \
   -H "X-User-Id: bob-uuid" \
   -H "Content-Type: application/json" \
   -d "{\"decision\": \"APPROVE\"}"
2. بررسی خروجی: وضعیت APPROVED

**Expected Outcome**: درخواست به وضعیت APPROVED تبدیل می‌شود.

### Scenario 3: بررسی و برگشت درخواست برای اصلاح

**Prerequisites**: درخواستی در وضعیت PENDING_REVIEW، کاربر Reviewer (bob) noho created است.

**Steps**:
1. curl -X POST http://localhost:3000/api/requests/{uuid}/review \
   -H "X-User-Id: bob-uuid" \
   -H "Content-Type: application/json" \
   -d "{\"decision\": \"REQUEST_CHANGES\", \"comments\": \"Needs more details on API changes\"}"
2. بررسی خروجی: وضعیت CHANGES_REQUESTED
3. Requester (alice) درخواست را اصلاح می‌کند و دوباره submit می‌کند:
   curl -X POST http://localhost:3000/api/requests/{uuid}/submit \
   -H "X-User-Id: alice-uuid" \
   -H "Content-Type: application/json"
4. بررسی خروجی: وضعیت PENDING_REVIEW

**Expected Outcome**: درخواست به CHANGES_REQUESTED تبدیل می‌شود، سپس پس از اصلاح به PENDING_REVIEW برمی‌گردد.

### Scenario 4: Self-approval prevention (NON-NEGOTIABLE)

**Prerequisites**: کاربر alice هم‌زمان نقش Requester و Reviewer دارد.

**Steps**:
1. alice یک درخواست تغییر ثبت می‌کند:
   curl -X POST http://localhost:3000/api/requests \
   -H "X-User-Id: alice-uuid" \
   -H "Content-Type: application/json" \
   -d "{\"title\": \"Test\", \"description\": \"Test\", \"reason\": \"Test\"}"
2. alice سعی می‌کند درخواست خود را تأیید کند:
   curl -X POST http://localhost:3000/api/requests/{uuid}/review \
   -H "X-User-Id: alice-uuid" \
   -H "Content-Type: application/json" \
   -d "{\"decision\": \"APPROVE\"}"

**Expected Outcome**: پاسخ 403 Forbidden دریافت می‌شود: Error: Self-approval is not allowed. درخواست در وضعیت PENDING_REVIEW حفظ می‌شود.

### Scenario 5: درخواست تکراری (CHANGES_REQUESTED -> Submit -> PENDING_REVIEW)

**Prerequisites**: درخواستی در وضعیت CHANGES_REQUESTED.

**Steps**:
1. Requester درخواست را اصلاح می‌کند.
2. curl -X POST http://localhost:3000/api/requests/{uuid}/submit \
   -H "X-User-Id: alice-uuid" \
   -H "Content-Type: application/json"
3. بررسی خروجی: وضعیت PENDING_REVIEW

**Expected Outcome**: درخواست به PENDING_REVIEW تبدیل می‌شود و قابل بررسی مجدد است.

### Scenario 6: Prevent lost updates (concurrency)

**Prerequisites**: دو درخواست هم‌زمان برای یک ChangeRequest.

**Steps**:
1. دو Reviewer هم‌زمان سعی می‌کنند درخواست را بررسی کنند.
2. بررسی خروجی: تنها یکی موفق است (200 OK)، دومي خطای 409 Conflict دریافت می‌کند.

**Expected Outcome**: سیستم از بازنویسی بی‌صدا جلوگیری می‌کند؛ یکی از درخواست‌ها خطای کنسولتنگ (409 Conflict) دریافت می‌کند.

### Scenario 7: Approved request is not editable

**Prerequisites**: درخواستی در وضعیت APPROVED.

**Steps**:
1. Requester سعی می‌کند درخواست APPROVED را submit کند.
   curl -X POST http://localhost:3000/api/requests/{uuid}/submit \
   -H "X-User-Id: alice-uuid" \
   -H "Content-Type: application/json"

**Expected Outcome**: پاسخ 400 Bad Request دریافت می‌شود: Error: Cannot submit approved request.

## Success Criteria for Quickstart

- هم‌ entirety سناریوها بالا بدون خطای غیرمنتظر اجرا می‌شوند.
- Self-approval (Scenario 4) با 403 Forbidden مواجه می‌شود.
- کنسولتنگ (Scenario 6) با 409 Conflict به صورت صحیح کار می‌کند.
- وضعیت‌های درخواست به درستی transition می‌شوند.
- پاسخ‌های API در فرمت JSON هستند.

## Links

- [Data Model](./data-model.md) — entities, fields, relationships, state transitions
- [API Contract](./contracts/api-contract.md) — endpoint schemas, error handling, validation rules
- [Research](./research.md) — storage, architecture, authentication, concurrency decisions
