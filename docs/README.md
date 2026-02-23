# Synthetic Persona Web - Docs

Reference docs for the current application state.

## Quickstart (local)

```bash
npm install
cp .env.example .env.local
docker-compose up -d
npm run db:setup
npm run db:auth:setup
npm run db:locale:migrate # existing DB upgrade only
npm run embed
npm run dev
# open: http://localhost:3000
```

## Current routes

### Protected app routes (`src/app/(app)`)
- `/` - Idea Stress Test
- `/copywriter` - Copywriter
- `/profile` - profile overview + guided 2FA setup wizard
- `/profile/security` - security settings + password change
- `/admin/users` - admin-only user management

### Auth routes (`src/app/(public)`)
- `/login` - credentials login
- `/login/2fa` - second-factor verification during sign-in
- `/register` - compatibility route that redirects to `/admin/users` (middleware still requires auth)

## Auth model

- Auth.js credentials provider (`next-auth` v5 beta)
- Sessions use JWT strategy
- Middleware protects non-public pages
- 2FA status (`two_factor_enabled`) is mapped into session/JWT and surfaced in `/profile`
- UI locale (`locale`) is mapped into session/JWT when set on user
- Users without 2FA are redirected to `/profile` right after login
- Protected routes (except `/profile/*`) display a blocking 2FA-required modal until setup is complete

## i18n model

- Supported locales: `es-MX` (default), `en-US`
- Detection order:
  - Logged in: DB user locale -> cookie (`sbp_locale`) -> browser locale -> `es-MX`
  - Logged out: cookie (`sbp_locale`) -> browser locale -> `es-MX`
- Language switch persists immediately in cookie and, when authenticated, to DB via `PATCH /api/account/locale`
- Localized scope is frontend UI copy; API payload text is not translated server-side

## Key APIs

- `POST /api/stress-test`
- `POST /api/idea-refinement`
- `GET/POST /api/copywriter`
- `POST /api/register`
- `POST /api/account/password/change`
- `PATCH /api/account/locale`
- `GET /api/admin/users`
- `PATCH /api/admin/users/[id]`
- `DELETE /api/admin/users/[id]`
- `POST /api/2fa/generate`
- `POST /api/2fa/verify`
- `GET/POST /api/auth/[...nextauth]`
- `GET /api/personas`
- `GET /api/industries`
- `GET /api/cities`
- `GET /api/challenge-levels`
- `POST /api/berumen` (legacy)
- `POST /api/scorecard` (legacy)
- `POST /api/persona` (legacy streaming)
- `POST /api/action-card` (experimental)

## Data model and RAG

- Personas: `data/personas/<persona_id>/persona.json`
- Persona knowledge: `data/personas/<persona_id>/knowledge/*`
- Global knowledge: `data/global-knowledge/*`
- Industries: `data/industries/*.json`
- Challenge levels: `data/challengelevels/*.json`
- Copywriter config: `data/copywriter/**`

Run `npm run embed` after modifying `data/`.

## i18n docs

- `docs/I18N.md` - architecture and implementation
- `docs/i18n-glossary.md` - approved bilingual terminology
