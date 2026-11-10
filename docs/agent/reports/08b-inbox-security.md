# Report 08b — Demo Inbox Security & Account Takeover Prevention

## Overview
Addressed the critical vulnerability identified by the strategy lead in `docs/agent/INBOX.md` (2026-11-10 01:10 UTC item) where unauthenticated access to the demo inbox previously permitted password reset token harvesting, OTP extraction, and unauthorized clearing.

All 5 remediation items have been implemented and verified in strict order.

---

## 1. Purge Access Control (SUPERADMIN Only)
- In `src/app/api/demo-inbox/route.ts`:
  - `DELETE /api/demo-inbox` now strictly verifies session authentication via `getSessionUser()`.
  - Non-authenticated callers or non-superadmin accounts receive HTTP `403 Forbidden` (`{ error: "Forbidden. Superadmin role required to purge communications." }`).

---

## 2. Seeded Demo Account Protection (`*@demo.ceda.bw`)
- Implemented `isDemoAccount()` in `src/lib/auth-lockout.ts` to identify all official demo logins (`super@demo.ceda.bw`, `admin@demo.ceda.bw`, `innovator@demo.ceda.bw`, `evaluator@demo.ceda.bw`, `consultant@demo.ceda.bw`, etc.).
- Enforced rejection across all mutation and authentication vectors:
  - `POST /api/auth/forgot-password`: Rejects reset dispatch with `"Demo accounts use the shared demo password (CedaDemo2026!) and cannot be reset."` (HTTP 400).
  - `POST /api/auth/reset-password`: Rejects token execution targeting demo accounts (HTTP 400).
  - `POST /api/auth/change-password`: Blocks password updates from logged-in demo sessions (HTTP 400).
  - `POST /api/auth/otp/send` & `POST /api/auth/otp/verify`: Disallows OTP generation or sign-in for demo accounts.
- Ensures one-click judge demo accounts remain completely immutable and accessible with the shared demo password `CedaDemo2026!`.

---

## 3. Session-Scoped Inbox & Masked Audit
- **Session Scoping (`src/lib/comms/session.ts`)**:
  - `getOrCreateInboxSessionId(req)` generates or reads an `httpOnly`, `sameSite: "lax"`, 7-day cookie named `ceda_inbox_session`.
  - Registration, password reset requests, and OTP dispatches pass this `inboxSessionId` into `sendEmail`/`sendSms`, storing it securely in the message's `metadata`.
  - When returning messages, `GET /api/demo-inbox` filters by matching `metadata.inboxSessionId === cookieValue`.
  - Unauthenticated users without a session cookie receive an empty message list (`{ messages: [] }`), preventing any token harvesting from other users or judges.
  - A judge sees only the verification codes and reset links triggered in their own browser session.
- **Masked Superadmin Global Audit**:
  - `SUPERADMIN` accounts can view all global messages, but sensitive fields are dynamically sanitized by `maskSensitiveComms()`:
    - 6-digit numeric passcodes are replaced with `******`.
    - Token query parameters in action URLs and bodies are masked with `token=******`.
    - Prevents administrators or compromised staff sessions from stealing user tokens.

---

## 4. Rate Limiting & 5-Attempt OTP Lockout
- In `src/lib/auth-lockout.ts` and `src/lib/rate-limit.ts`:
  - Enforced rate limiting of **5 requests per 15 minutes** per IP and per destination email/phone across `/api/auth/forgot-password`, `/api/auth/otp/send`, and `/api/auth/otp/verify`.
  - Enforced a strict **5-strike lockout**: after 5 consecutive incorrect OTP verification attempts, the destination is locked out for 15 minutes (HTTP 429).
  - Successful verification resets the counter immediately via `resetOtpLockout()`.

---

## 5. Verification & Smoke Tests
- Created unit test suite `tests/phase8b-inbox-security.test.ts` verifying:
  - Demo account recognition (`isDemoAccount`).
  - Sensitive token and OTP regex masking (`maskSensitiveComms`).
  - 5-attempt threshold tracking and lockout enforcement.
  - Multi-session inbox cookie isolation.
- Added Playwright smoke test to `tests/e2e/smoke.spec.ts`:
  - Anonymous `DELETE /api/demo-inbox` returns 401/403.
  - Password reset request for `super@demo.ceda.bw` returns 400 with the protected account message.
  - Anonymous `GET /api/demo-inbox` returns an empty array with no cross-session tokens.
- Test suites:
  - All 53 unit tests pass across 17 test suites (`yarn tsx --test tests/*.test.ts`).
  - `yarn typecheck` completed with **0 errors**.
  - `yarn lint` completed with **0 warnings and 0 errors**.
  - Playwright role $\times$ link matrix smoke tests pass cleanly.
