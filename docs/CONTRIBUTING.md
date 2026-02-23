# Contributing to Synthetic Persona Web

Thanks for contributing. This guide reflects the current repository setup.

## 1. Development setup

1. Clone and enter repo.
```bash
git clone https://github.com/breyesr/sbp-berumen.git
cd sbp-berumen
```

2. Install dependencies.
```bash
npm install
```

3. Configure env vars.
```bash
cp .env.example .env.local
```
Set at minimum:
- `OPENAI_API_KEY`
- `AUTH_SECRET`
- `POSTGRES_URL_LOCAL` (local docker db)

4. Start local DB.
```bash
docker-compose up -d
```

5. Initialize tables and ingest content.
```bash
npm run db:setup
npm run db:auth:setup
npm run embed
```

6. Run app.
```bash
npm run dev
```

Open `http://localhost:3000`.

## 2. Important script safety notes

- `npm run db:auth:setup` recreates auth tables and removes existing users/sessions.
- `npm run db:reset` drops app/auth tables.
- Use those scripts carefully on shared or production-like databases.

## 3. Content ingestion workflow

- Add/update files in `data/`.
- Run `npm run embed`.

Folders:
- `data/global-knowledge/`
- `data/personas/<persona_id>/knowledge/`
- `data/personas/<persona_id>/persona.json`
- `data/copywriter/`

## 4. Project structure (high level)

- `src/app/(app)/` protected UI routes (`/`, `/copywriter`, `/profile`, `/profile/security`, `/admin/users`)
- `src/app/(public)/` auth routes (`/login`, `/login/2fa`) + middleware-protected `/register` compatibility redirect
- `src/app/api/` server endpoints
- `src/lib/` DB, auth, RAG, and AI helpers
- `src/lib/i18n/` locale config, dictionaries, translator helpers
- `src/components/i18n/` provider + language switch UI
- `docs/` documentation

## 5. i18n contribution workflow

- Add or edit keys in `src/lib/i18n/messages.ts` for both `es-MX` and `en-US`.
- Use keys from components/pages via `useI18n().t("key")`; avoid hardcoded UI strings.
- Keep Spanish copy neutral-MX and user-facing (not literal machine translation).
- For existing DBs, run `npm run db:locale:migrate` once to add `users.locale`.
- Validate locale persistence:
  - logged out: cookie-based
  - logged in: DB + session-based

## 6. Git workflow

- Base production branch: `main`
- Feature branches: `feature/*`
- Bugfix branches: `fix/*`
- Open PRs into `main` unless maintainers specify otherwise.

Commit style:
- Use Conventional Commits when possible (`feat:`, `fix:`, `docs:`, etc.).

## 7. Deployment

- Vercel previews are created from branches/PRs.
- `main` deploys to production.
- See `docs/DEPLOYMENT.md` for env + DB setup details.
