# Deployment Guide - Synthetic Persona Web

This guide covers Vercel deployment for current app behavior, including credentials auth and 2FA.

## 1. Prerequisites

- GitHub repository connected to Vercel
- Vercel project with Postgres storage (or external Postgres)
- Local Node.js for one-time DB setup scripts

## 2. Required environment variables in Vercel

Set in `Project -> Settings -> Environment Variables`.

| Variable | Required | Notes |
| --- | --- | --- |
| `POSTGRES_URL` | Yes | DB connection string used at runtime in Vercel |
| `OPENAI_API_KEY` | Yes | Required because server modules validate this on import |
| `AUTH_SECRET` | Yes | Required for Auth.js session/token encryption |
| `OPENAI_MODEL` | Optional | Defaults to `gpt-4o-mini` |

Important:
- Ensure `POSTGRES_URL`, `OPENAI_API_KEY`, and `AUTH_SECRET` are available to both `Preview` and `Production` as needed.

## 3. First deployment setup

1. Import repo in Vercel and deploy.
2. Add all required env vars.
3. Initialize DB tables.

### 3.1 Initialize RAG documents table

```bash
POSTGRES_URL='YOUR_VERCEL_DB_URL' npm run db:setup
```

### 3.2 Initialize auth + RBAC tables

`db:auth:setup` is destructive for auth tables (`users`, `sessions`, roles mappings).
Use it only for initial setup or intentional reset.

```bash
NODE_ENV=production \
POSTGRES_URL='YOUR_VERCEL_DB_URL' \
OPENAI_API_KEY='dummy-or-real-key' \
npm run db:auth:setup
```

Why `NODE_ENV=production` is needed:
- `src/lib/clients.ts` selects `POSTGRES_URL` only in production mode; otherwise it may use `POSTGRES_URL_LOCAL`.

### 3.2b Upgrade existing auth DB for locale support (non-destructive)

If your DB already has users and you are adding i18n support, run:

```bash
NODE_ENV=production \
POSTGRES_URL='YOUR_VERCEL_DB_URL' \
OPENAI_API_KEY='dummy-or-real-key' \
npm run db:locale:migrate
```

### 3.3 Ingest knowledge data

```bash
POSTGRES_URL='YOUR_VERCEL_DB_URL' \
OPENAI_API_KEY='YOUR_OPENAI_KEY' \
npm run embed
```

### 3.4 One-Command Staging/New Environment Setup (Recommended)

For a fresh environment (like Staging), use the bootstrap script to initialize all schemas and create the initial Admin user in one go.

```bash
POSTGRES_URL='YOUR_DB_URL' \
ADMIN_EMAIL='your@email.com' \
ADMIN_PASSWORD='yourpassword' \
npx tsx scripts/db/bootstrap-staging.ts
```

This script:
- Cleans the DB (drops existing tables).
- Creates all schemas (Auth, Personas, Clusters, Access).
- Creates the Admin user and assigns the `admin` role + all clusters.

## 4. Branch and environment behavior

- `main` deploys to Production
- feature branches / PRs deploy to Preview

For Preview auth testing, confirm these are set for Preview scope:
- `AUTH_SECRET`
- `POSTGRES_URL`
- `OPENAI_API_KEY`

## 5. Rollback process

Preferred rollback path:
1. Revert bad commit on `main` (do not force-reset shared history)
2. Push revert
3. Let Vercel redeploy

Optional fast path:
- Use Vercel Instant Rollback, then still reconcile Git history with a revert commit.

## 6. Troubleshooting

### `GET /api/auth/session 500`
Likely causes:
- Missing `AUTH_SECRET`
- Missing `POSTGRES_URL`
- Missing auth tables (`users`, etc.)

### Admin user creation returns `relation "users" does not exist`
- Auth schema not initialized on the DB used by deployment
- Run `db:auth:setup` against the correct DB URL

### Build succeeds, preview page shows access issues
- Check Vercel preview protection and account access
- Verify cookies/popups if using browser auth gates

### Next.js warning about `eslint` in `next.config.ts`
- Current warning is non-fatal for deployment but should be cleaned up separately.
