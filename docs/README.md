# Synthetic Persona Web — Docs

This project provides two main product surfaces: an **Idea Stress Test** and a **Copywriter**. Both use persona data and optional RAG context from a Postgres + pgvector store.

## Quickstart (local)

```bash
npm install
cp .env.example .env.local
docker-compose up -d
npm run db:setup
npm run embed
npm run dev
# open: http://localhost:3000
```

## Product surfaces

### 1) Idea Stress Test (UI)
- **Route**: `/` (`src/app/page.tsx`)
- **Flow**:
  1. Load personas + challenge levels.
  2. Submit idea, goal, and evaluation focus to `/api/stress-test`.
  3. Display reaction, verdict, strengths, gaps, questions, and confidence.
  4. Optionally refine the pitch with `/api/idea-refinement`.

### 2) Copywriter (UI)
- **Route**: `/copywriter` (`src/app/copywriter/page.tsx`)
- **Flow**:
  1. Select persona + platforms + formats.
  2. Submit context + message + goal to `/api/copywriter`.
  3. Receive platform/format‑specific copy outputs.

## Key APIs

- `POST /api/stress-test` — persona simulation + critique
- `POST /api/idea-refinement` — missing‑info questions + rewrite
- `GET/POST /api/copywriter` — platform/format catalog + copy generation
- `POST /api/berumen` — persona answer + consultant analysis
- `POST /api/scorecard` — marketing efficiency scorecard (legacy UI not wired)
- `POST /api/persona` — streaming persona Q&A (messages‑based)
- `GET /api/personas` — list personas
- `GET /api/industries` — list industries
- `GET /api/cities` — list cities
- `GET /api/challenge-levels` — list challenge levels

## Data model & RAG

- **Personas**: `data/personas/<persona_id>/persona.json`
- **Persona knowledge**: `data/personas/<persona_id>/knowledge/*`
- **Global knowledge**: `data/global-knowledge/*`
- **Industries**: `data/industries/*.json`
- **Challenge levels**: `data/challengelevels/*.json`
- **Copywriter platform/format rules**: `data/copywriter/**`

Run `npm run embed` after changing any content in `data/`.

## Notes

- LLM calls are server‑side only; API keys are never exposed to the browser.
- The database is required for RAG; core flows still run without RAG content, but embeddings and hybrid search rely on Postgres + pgvector.

