# Data Model: مدیریت درخواست‌های تغییر (ChangeFlow)

## Entities

### ChangeRequest
یک درخواست تغییر شامل شامل موارد زیر:

| فیلد | نوع | توضیح |
|------|-----|-------|
| id | UUID | شناسه یکتا درخواست (Primary Key) |
| title | string | عنوان درخواست تغییر |
| description | string | شرح کامل تغییر مورد درخواست |
| reason | string | دلیل تغییر (برای ارزیابی اهمیت) |
| requester_id | UUID | شناسه ثبت‌کننده (FK به User) |
| status | enum | وضعیت فعلی: Draft, PendingReview, Approved, ChangesRequested |
| version | int | شماره نسخه برای کنسولتنگ (Optimistic Locking) |
| created_at | timestamp | تاریخ ثبت |
| updated_at | timestamp | تاریخ آخرین ویرایش |

**قواعد اعتبارسازی**:
- title، description، reason، requester_id الزامی هستند.
- status باید یکی از مقادیر مجاز باشد (Draft, PendingReview, Approved, ChangesRequested).
- version باید با هر تغییر افزایش یاب (کنسولتنگ).

**انتقال‌های وضعیت**:
- Draft ──Submit──> PendingReview
- PendingReview ──Approve──> Approved
- PendingReview ──RequestChanges──> ChangesRequested
- ChangesRequested ──Submit──> PendingReview
- Approved: حالت پایانی، قابل ویرایش نیست.

### User
یک کارمند با نقش(es):

| فیلد | نوع | توضیح |
|------|-----|-------|
| id | UUID | شناسه یکتا کاربر |
| username | string | نام کاربری یکتا |
| role | enum | نقش: Requester, Reviewer, یا هر دو |

**قواعد اعتبارسازی**:
- username الزامی و یکتا است.
- کاربر باید حداقل یک نقش داشته باشد.

### Review
یک بررسی تغییر توسط Reviewer:

| فیلد | نوع | توضیح |
|------|-----|-------|
| id | UUID | شناسه یکتا بررسی |
| change_request_id | UUID | شناسه درخواست تغییر (FK به ChangeRequest) |
| reviewer_id | UUID | شناسه بررسی‌کننده (FK به User) |
| decision | enum | تصمیم: Approve, RequestChanges |
| comments | string | نظر بررسی‌کننده (زامی برای RequestChanges) |
| created_at | timestamp | تاریخ بررسی |

**قواعد اعتبارسازی**:
- change_request_id، reviewer_id، decision الزامی هستند.
- decision باید Approve یا RequestChanges باشد.
- برای RequestChanges، comments الزامی است.

## Relationships

- ChangeRequest → User (requester): یک-به-یک، درخواست توسط یک ثبت‌کننده ثبت می‌شود.
- ChangeRequest → Review (review): یک-به-چند، یک درخواست می‌تواند چندین بررسی داشته باشد (هر بررسی از یک Reviewer متفاوت).
- Review → User (reviewer): یک-به-یک، هر بررسی توسط یک Reviewer انجام می‌شود.
- User → Role: یک-به-چند، یک کاربر می‌تواند چندین نقش داشته باشد (مثلا Requester و Reviewer هم‌زمان).

## Validation Rules (from FR requirements)

1. **FR-001**: ChangeRequest باید فیلدهای الزامی (title, description, reason, requester_id, status) داشته باشد.
2. **FR-002**: Requester فقط می‌تواند درخواست خود (در وضعیت Draft) را ویرایش کند.
3. **FR-007**: Self-approval ممنوع است — Reviewer نمی‌تواند درخواست خود را تأیید کند (即使 reviewer_id == requester_id).
4. **FR-008**: Approved درخواست قابل ویرایش نیست.
5. **FR-009**: تغییر وضعیت باید بر اساس هویت، مجوز فعلی و وضعیت فعلی درخواست بررسی شود.
6. **FR-010**: کنسولتنگ برای Prevention of lost updates در درخواست‌های هم‌زمان.

## State Transition Constraints

- Draft → PendingReview: فقط توسط Requester، و فقط اگر درخواست کامل است.
- PendingReview → Approved: فقط توسط Reviewer، و فقط اگر Requester != Reviewer (self-approval check).
- PendingReview → ChangesRequested: فقط توسط Reviewer، با تحديد comments.
- ChangesRequested → PendingReview: فقط توسط Requester، بعد اصلاح.
- Approved → Any: مجاز نیست (حالت پایانی).
