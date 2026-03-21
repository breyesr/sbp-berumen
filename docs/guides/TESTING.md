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
- Visit `/register` while logged out -> redirected to `/login` by middleware.

### B. 2FA onboarding wizard (`/profile`)

- Status shows `Disabled` for new account.
- Step flow works in order: choose platform -> confirm app already installed (Yes/No) -> complete setup -> verify.
- Step 1 has no Continue button; selecting iOS/Android auto-advances to Step 2.
- Setup details are generated automatically when Step 2 is completed (no separate generation step).
- If user selects `Yes` (already installed), setup generation starts immediately (no extra Continue click).
- Mobile path: direct app listing link is shown (not store search), no QR.
- Desktop install path: QR is explicitly labeled as app-download QR for phone camera only (not authenticator scan).
- Mobile complete-setup path: manual setup key + copy action is shown (no QR image).
- Desktop complete-setup path: QR image is shown with manual setup key fallback.
- After successful verify, UI immediately shows clear success and `2FA is active` state.
- Sign out and sign in again; verify 2FA code is required.
- While 2FA is disabled, visiting protected routes other than `/profile` shows blocking 2FA modal.
- Modal CTA sends user to `/profile` and page behind modal is not interactive.

### C. Password change (`/profile/security`)

- With 2FA enabled, submit correct current password + valid 2FA code and confirm password change succeeds.
- Confirm mismatched new-password confirmation is blocked client-side.
- Confirm wrong current password returns API `400`.
- Confirm invalid 2FA code returns API `400`.
- After successful password change, confirm user is signed out and must log in with new password.

### D. Admin user management (`/admin/users`)

- Log in as admin and confirm page loads user table.
- Create a new user with role `user`; verify credentials work and 2FA onboarding is required.
- Promote a user to `admin`, then demote back to `user`.
- Verify non-admin account cannot access `/admin/users` features and receives API `403` on admin endpoints.
- Verify self-delete and removing own admin role are blocked.
- Verify deleting the last admin is blocked.

### E. Idea Stress Test

- Submit valid payload and verify response sections (reaction, strengths, gaps, questions, confidence).
- Challenge levels load from `/api/challenge-levels`.

### F. Idea refinement

- Trigger `needs_input` path.
- Submit follow-up answers and verify refined pitch response.

### G. Copywriter

- Load catalog from `GET /api/copywriter`.
- Generate copy from `POST /api/copywriter` for at least one platform/format pair.

### H. Vercel preview sanity

- Confirm Preview env vars: `POSTGRES_URL`, `OPENAI_API_KEY`, `AUTH_SECRET`.
- Confirm `/api/auth/session` does not return 500.
- Confirm admin user creation does not fail with `relation "users" does not exist`.

### I. i18n and locale persistence

- Confirm language switch (`ES | EN`) is visible in header on auth + app pages.
- Switch to `EN` and verify login, 2FA login, profile, profile security, admin users copy updates immediately.
- While logged out, refresh page and confirm language is preserved via cookie.
- While logged in, switch language, sign out/sign in, and confirm preference persists (DB-backed).
- Confirm `PATCH /api/account/locale` returns `200` and `users.locale` is updated.
- Confirm no raw translation keys (`[missing:...]`) appear in UI.

## 3. Suggested future automation

- Integration tests for auth/admin endpoints (`/api/register`, `/api/admin/users/*`, `/api/account/password/change`, `/api/2fa/*`, session behavior).
- Contract tests for stress-test/refinement/copywriter schema responses.
- End-to-end flow test: admin creates user -> user profile 2FA setup -> logout/login with 2FA.
