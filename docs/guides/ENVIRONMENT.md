# Environment Configuration

This document describes environment requirements for local, preview, and production.

## 1. Runtime versions

- Node.js: `>=20`
- Next.js: `16.x`
- TypeScript: `5.x`
- Package manager: `npm`

## 2. Environment variables

| Variable | Scope | Required | Description |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Local + Vercel | Yes | Required for AI calls and for modules that validate env on import |
| `AUTH_SECRET` | Local + Vercel | Yes | Auth.js secret for signing/encrypting tokens/sessions |
| `POSTGRES_URL_LOCAL` | Local | Yes (local runtime) | Local Postgres connection string |
| `POSTGRES_URL` | Preview + Prod | Yes | Vercel/runtime Postgres connection string |
| `OPENAI_MODEL` | Optional | No | Chat model override (default `gpt-4o-mini`) |
| `NEXT_PUBLIC_STRESS_DEBUG` | Optional | No | If `1`, enables stress-test debug payloads |

Notes:
- `src/lib/clients.ts` validates DB + OpenAI vars at module load.
- Missing required vars can fail routes even before endpoint logic runs.

## 3. Local `.env.local` setup

```bash
cp .env.example .env.local
```

Example:

```env
POSTGRES_URL_LOCAL="postgresql://user:password@localhost:5433/persona_db"
POSTGRES_URL=""
OPENAI_API_KEY="sk-..."
AUTH_SECRET="replace-with-long-random-secret"
OPENAI_MODEL="gpt-4o-mini"
```

Generate a secret (example):

```bash
openssl rand -hex 32
```

## 4. Vercel env setup

Set these in `Project -> Settings -> Environment Variables`:
- `POSTGRES_URL`
- `OPENAI_API_KEY`
- `AUTH_SECRET`

Ensure `Preview` scope includes all required vars if you test auth on preview URLs.

## 5. Script behavior by environment

- `npm run db:setup`
  - Uses `POSTGRES_URL` if present, otherwise `POSTGRES_URL_LOCAL`.
- `npm run db:auth:setup`
  - Uses `src/lib/clients.ts` selection logic.
  - To target Vercel DB explicitly, run with `NODE_ENV=production` and set `POSTGRES_URL`.
- `npm run db:locale:migrate`
  - Safe for existing DBs where auth schema already exists.
  - Adds/repairs `users.locale` and locale check constraint.
  - Uses the same DB selection logic as other DB scripts.

Example (target preview/prod DB):

```bash
NODE_ENV=production \
POSTGRES_URL='postgresql://...' \
OPENAI_API_KEY='dummy' \
npm run db:auth:setup
```

## 6. Security practices

- Never commit `.env.local`.
- Store secrets only in Vercel env manager for cloud deploys.
- Treat `db:auth:setup` and `db:reset` as destructive operations.
