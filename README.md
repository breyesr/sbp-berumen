# Synthetic Persona Web

A Next.js app for stress‑testing business ideas with synthetic personas and generating platform‑specific marketing copy. It uses local persona/industry data plus optional RAG from a Postgres + pgvector store.

## What’s in the product

- **Idea Stress Test (UI)**: collect idea + goal + evaluation focus, run a persona simulation, and optionally refine the pitch.
- **Copywriter (UI)**: generate copy per platform/format using persona voice and platform rules.
- **APIs**: stress‑test, idea‑refinement, copywriter, persona list, industries, cities, and challenge levels.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- OpenAI API (chat + embeddings)
- Postgres + pgvector for RAG
- Tailwind CSS v4

## Quick start (local)

1) Install deps
```bash
npm install
```

2) Configure env
```bash
cp .env.example .env.local
```

3) Start the local database
```bash
docker-compose up -d
```

4) Create schema + ingest data
```bash
npm run db:setup
npm run embed
```

5) Run the app
```bash
npm run dev
```

Open http://localhost:3000

## Required environment variables

See `docs/ENVIRONMENT.md` for details.

- `OPENAI_API_KEY` (required)
- `POSTGRES_URL_LOCAL` (required for local RAG)
- `POSTGRES_URL` (required for Vercel)
- `OPENAI_MODEL` (optional override)

## Useful scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — lint
- `npm run db:setup` — create schema/indexes
- `npm run embed` — ingest data into vector DB

## Documentation

- `docs/README.md` — product overview
- `docs/API.md` — API reference
- `docs/PROJECT_DOCUMENTATION.txt` — technical deep‑dive
- `docs/ENVIRONMENT.md` — env vars
- `docs/DEPLOYMENT.md` — Vercel deployment
- `docs/TESTING.md` — testing guidance

