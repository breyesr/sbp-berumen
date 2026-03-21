# API Reference

Synthetic Persona Web exposes App Router API routes under `/api/*`.

## Base URLs

- Local: `http://localhost:3000`
- Vercel preview/prod: deployment URL shown by Vercel

## Auth and access model

- Browser app uses credentials auth via Auth.js (`next-auth`).
- Public UI routes: `/login`, `/login/2fa`.
- All other non-API pages are protected by middleware and redirect to `/login` when unauthenticated.
- Users without 2FA are redirected to `/profile` after login and blocked from other protected pages until setup is completed.
- User provisioning requires an authenticated admin role.
- API auth is session-based where required.

## Error format

Most error responses return:

```json
{ "error": "string" }
```

---

## Auth and account endpoints

### `GET|POST /api/auth/[...nextauth]`
Auth.js route handler (session, callback, csrf, providers internals).

### `POST /api/register`
Creates a new credentials user. **Admin-only endpoint**.

Request body:

```json
{ "email": "user@example.com", "password": "secret", "role": "user" }
```

Responses:
- `201` user created
- `400` missing email/password
- `401` unauthenticated
- `403` non-admin caller
- `409` email already exists
- `500` internal error

### `POST /api/account/password/change`
Changes the authenticated user's password. Requires current password + active 2FA code.

Request body:

```json
{
  "currentPassword": "old-secret",
  "newPassword": "new-strong-secret",
  "code": "123456"
}
```

Responses:
- `200` password changed
- `400` invalid payload, wrong current password, 2FA missing/invalid
- `401` unauthenticated
- `500` internal error

### `PATCH /api/account/locale`
Persists authenticated user's UI locale preference.

Request body:

```json
{ "locale": "es-MX" }
```

Allowed values:
- `es-MX`
- `en-US`

Responses:
- `200` locale saved
- `400` invalid locale
- `401` unauthenticated

### `GET /api/admin/users`
Returns all users with `id`, `email`, `two_factor_enabled`, and `roles[]`.

Responses:
- `200` users list
- `401` unauthenticated
- `403` non-admin caller
- `500` internal error

### `PATCH /api/admin/users/[id]`
Updates user email and/or role. **Admin-only endpoint**.

Request body (one or both fields):

```json
{ "email": "updated@example.com", "role": "admin" }
```

Responses:
- `200` user updated
- `400` invalid input or protected action (e.g. removing own admin role)
- `401` unauthenticated
- `403` non-admin caller
- `404` user not found
- `409` email already exists
- `500` internal error

### `DELETE /api/admin/users/[id]`
Deletes a user. **Admin-only endpoint**.

Responses:
- `200` user deleted
- `400` protected action (e.g. self-delete / deleting last admin)
- `401` unauthenticated
- `403` non-admin caller
- `404` user not found
- `500` internal error

### `POST /api/2fa/generate`
Authenticated endpoint. Generates TOTP secret + QR payload and stores secret for current user.

Response:

```json
{ "qrCodeDataUrl": "data:image/png;base64,...", "secret": "BASE32SECRET" }
```

### `POST /api/2fa/verify`
Authenticated endpoint. Verifies user-entered TOTP code and enables 2FA.

Request body:

```json
{ "code": "123456" }
```

Responses:
- `200` 2FA enabled
- `400` missing/invalid code or missing setup
- `401` unauthenticated
- `500` internal error

---

## Idea Stress Test

### `POST /api/stress-test`
Runs persona critique against an idea.

Request body:

```json
{
  "personaType": "string",
  "challengeLevelId": "string",
  "idea": "string",
  "goal": "string",
  "evaluationFocus": "string"
}
```

Typical responses:
- `200` structured critique payload
- `400` validation error
- `404` persona/challenge not found
- `500` model/parse error

### `POST /api/idea-refinement`
Asks missing-info questions or returns refined pitch.

Request body includes:
- persona + challenge context
- original idea/goal
- stress-test output fragments
- optional user answers

Response variants:

```json
{ "status": "needs_input", "questions": ["..."] }
```

```json
{ "status": "ok", "refinedPitch": "...", "changesSummary": ["..."] }
```

---

## Copywriter

### `GET /api/copywriter`
Returns platform/format catalog and company guidelines.

### `POST /api/copywriter`
Generates copy outputs for selected platforms/formats.

Request body:

```json
{
  "personaType": "string",
  "context": "string",
  "message": "string",
  "goal": "string",
  "platforms": ["platform_id"],
  "formats": ["format_id"]
}
```

---

## Selectors and metadata

### `GET /api/personas`
Returns persona options.

### `GET /api/personas/[id]/knowledge`
Returns persona knowledge file names.

### `GET /api/industries`
Returns industries list.

### `GET /api/cities`
Returns cities list.

### `GET /api/challenge-levels`
Returns challenge-level options.

---

## Legacy and experimental endpoints

### `POST /api/berumen`
Legacy dual persona + consultant response.

### `POST /api/scorecard`
Legacy efficiency scorecard endpoint.

### `POST /api/persona`
Legacy streaming persona Q&A endpoint.

### `POST /api/action-card`
Experimental action-card generator.

---

## Server-side env dependencies

- `OPENAI_API_KEY` (required)
- `AUTH_SECRET` (required for auth/session)
- `POSTGRES_URL_LOCAL` (local runtime)
- `POSTGRES_URL` (Vercel preview/production runtime)
- `OPENAI_MODEL` (optional)

Note: `src/lib/clients.ts` validates DB + OpenAI vars on import.
