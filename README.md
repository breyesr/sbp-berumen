# Synthetic Persona Web

Next.js app to stress-test business ideas with synthetic personas and generate marketing copy, now with credentials auth and guided 2FA onboarding.

## Product surfaces

- `/(app)/` home (`/`): Idea Stress Test + optional refinement.
- `/copywriter`: persona-aware copy generation.
- `/profile`: account security and step-by-step 2FA setup wizard.
- Public auth routes: `/login`, `/register`, `/login/2fa`.

## 2FA enforcement

- After credentials login, users without 2FA are redirected to `/profile`.
- On protected pages other than `/profile`, users without 2FA see a blocking modal with a CTA to set up 2FA.
- Once 2FA is enabled, full app navigation is restored.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Auth.js / NextAuth (credentials + JWT sessions)
- OpenAI API (chat + embeddings)
- Postgres + pgvector (RAG + auth tables)
- Tailwind CSS v4

## Local quickstart

1. Install dependencies.
```bash
npm install
```
2. Configure environment.
```bash
cp .env.example .env.local
```
3. Start local Postgres.
```bash
docker-compose up -d
```
4. Initialize DB tables.
```bash
npm run db:setup
npm run db:auth:setup
```
5. Ingest content.
```bash
npm run embed
```
6. Run app.
```bash
npm run dev
```

Open `http://localhost:3000`.

## Required environment variables

See `docs/ENVIRONMENT.md` for details.

- `OPENAI_API_KEY` (required)
- `AUTH_SECRET` (required for auth/session encryption)
- `POSTGRES_URL_LOCAL` (required locally)
- `POSTGRES_URL` (required in Vercel preview/prod)
- `OPENAI_MODEL` (optional override)

## Scripts

- `npm run dev` - dev server
- `npm run build` - production build
- `npm run start` - run production build
- `npm run lint` - lint
- `npm run db:setup` - create/reset `documents` table + indexes
- `npm run db:auth:setup` - recreate auth/RBAC tables (destructive for users)
- `npm run db:reset` - drop project/auth tables (destructive)
- `npm run embed` - ingest data into vector DB

## Documentation

- `docs/README.md` - docs overview
- `docs/API.md` - API reference
- `docs/PROJECT_DOCUMENTATION.txt` - technical deep dive
- `docs/ENVIRONMENT.md` - environment variables
- `docs/DEPLOYMENT.md` - Vercel deployment runbook
- `docs/TESTING.md` - test checklist
