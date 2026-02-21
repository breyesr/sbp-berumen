# Testing Synthetic Persona Web

Current project status relies on manual QA plus runtime validation. This checklist reflects the current auth + 2FA flow.

## 1. Current state

- No dedicated automated test script in `package.json`.
- Runtime guards include Zod validation and server-side checks.

## 2. Manual QA checklist

### A. Authentication and access control

- Visit `/` while logged out -> redirected to `/login`.
- Log in with credentials and no 2FA enabled -> redirected to `/profile`.
- Log in with credentials; if account has 2FA enabled, confirm redirect to `/login/2fa`.
- Submit valid 2FA code and confirm access to `/`.
- Confirm `/login` and `/login/2fa` redirect to `/` when already authenticated.

### B. 2FA onboarding wizard (`/profile`)

- Status shows `Disabled` for new account.
- Step flow works in order: choose platform -> app links -> generate QR -> verify.
- Desktop path works: copy link / scan store-link QR from phone.
- After successful verify, UI immediately shows clear success and `2FA is active` state.
- Sign out and sign in again; verify 2FA code is required.
- While 2FA is disabled, visiting protected routes other than `/profile` shows blocking 2FA modal.
- Modal CTA sends user to `/profile` and page behind modal is not interactive.

### C. Admin user management (`/admin/users`)

- Log in as admin and confirm page loads user table.
- Create a new user with role `user`; verify credentials work and 2FA onboarding is required.
- Promote a user to `admin`, then demote back to `user`.
- Verify non-admin account cannot access `/admin/users` features and receives API `403` on admin endpoints.
- Verify self-delete and removing own admin role are blocked.
- Verify deleting the last admin is blocked.

### D. Idea Stress Test

- Submit valid payload and verify response sections (reaction, strengths, gaps, questions, confidence).
- Challenge levels load from `/api/challenge-levels`.

### E. Idea refinement

- Trigger `needs_input` path.
- Submit follow-up answers and verify refined pitch response.

### F. Copywriter

- Load catalog from `GET /api/copywriter`.
- Generate copy from `POST /api/copywriter` for at least one platform/format pair.

### G. Vercel preview sanity

- Confirm Preview env vars: `POSTGRES_URL`, `OPENAI_API_KEY`, `AUTH_SECRET`.
- Confirm `/api/auth/session` does not return 500.
- Confirm admin user creation does not fail with `relation "users" does not exist`.

## 3. Suggested future automation

- Integration tests for auth/admin endpoints (`/api/register`, `/api/admin/users/*`, `/api/2fa/*`, session behavior).
- Contract tests for stress-test/refinement/copywriter schema responses.
- End-to-end flow test: admin creates user -> user profile 2FA setup -> logout/login with 2FA.
