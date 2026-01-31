# Contributing to Synthetic Persona Web

Thanks for your interest in contributing! This guide will help you set up your environment, understand the workflow, and follow our standards.

---

## Development Setup (“Zero‑to‑Hero”)

This guide assumes **Node.js**, **npm**, and **Docker Desktop** are installed.

1) Clone the repository
```bash
git clone https://github.com/breyesr/synthetic-persona-web.git
cd synthetic-persona-web
```

2) Install dependencies
```bash
npm install
```

3) Configure environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` and add `OPENAI_API_KEY`. The example includes `POSTGRES_URL_LOCAL` for Docker.

4) Start the local database
```bash
docker-compose up -d
```

5) Set up database schema
```bash
npm run db:setup
```

6) Seed the database (ingestion)
```bash
npm run embed
```

7) Run the application
```bash
npm run dev
```
Open http://localhost:3000

---

## Managing Content (Ingestion Runbook)

The vector database follows a “convention over configuration” model based on the file system. To add, update, or remove content, modify files in `/data` and re‑run ingestion.

### Directory Structure

- `data/global-knowledge/`: files available to **all** personas
- `data/personas/<persona_id>/knowledge/`: files accessible only to that persona
- `data/personas/<persona_id>/persona.json`: persona core definition
- `data/copywriter/`: platform + format rules used by the copywriter

### How to Add or Update Content

1) Add files to the correct directory.
2) Run ingestion:
```bash
npm run embed
```

### How to Delete Content

1) Delete the source file.
2) Run ingestion:
```bash
npm run embed
```

---

## Project Structure

`src/`
 ├─ `app/`
 │   ├─ `api/`
 │   │   ├─ `stress-test/`         # Persona stress test API
 │   │   ├─ `idea-refinement/`     # Follow‑up Qs + pitch rewrite
 │   │   ├─ `copywriter/`          # Copywriter API + catalog
 │   │   ├─ `berumen/`             # Dual persona + consultant response
 │   │   ├─ `scorecard/`           # Legacy efficiency scorecard
 │   │   └─ `persona/`             # Streaming persona Q&A
 │   ├─ `page.tsx`                 # Stress test UI
 │   └─ `copywriter/page.tsx`      # Copywriter UI
 ├─ `components/`
 ├─ `lib/`
 │   ├─ `clients.ts`               # DB + OpenAI clients (env validation)
 │   ├─ `rag.ts`                   # Hybrid search
 │   ├─ `personaProvider.ts`       # Persona loading + RAG merge
 │   └─ ...

---

## Git Workflow & Commit Conventions

- Branches: `main` (production), `develop` (staging), `feat/*` (features), `fix/*` (bugfixes).
- Workflow: create feature branches off `develop`. Open PRs against `develop`.
- Commits: follow Conventional Commits.

---

## Deployment

Deployment is handled via Vercel. Every PR creates a Preview Deployment; merges to `main` deploy to production. See `docs/DEPLOYMENT.md`.

