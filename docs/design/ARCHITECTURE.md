# Architecture — Synthetic Persona Web

This document describes the current architecture centered around a Postgres‑based RAG pipeline and multiple AI‑driven product surfaces.

---

## 1. High-Level Overview

The application has two main phases: **Ingestion** (offline) and **Retrieval/Generation** (real‑time).

### Ingestion Flow (Offline)

The ingestion process reads source documents, creates embeddings, and stores them in Postgres.

`Source Files -> Chunking -> OpenAI Embeddings API -> Postgres (pgvector)`

### Retrieval & Generation Flow (Real-time)

When a user submits a request (stress test, copywriter, persona Q&A), the API retrieves relevant context from the database and builds prompts for the LLM.

```
           ┌──────────┐     POST /api/stress-test, /api/copywriter, /api/persona
Frontend ───▶ API Route├─┐
(React)    │           │ │
           └──────────┘ │
                        │
     ┌──────────────────┘
     │
     │ 1. getPersona(personaId, userQuery)
     ▼
┌──────────────────┐   2. hybridSearch(query, id)   ┌──────────────────┐
│ personaProvider  │───────────────────────────────▶│      rag.ts      │
└──────────────────┘                                └─────────┬────────┘
                                                              │ 3. DB Query
                                                              ▼
                                                     ┌──────────────────┐
                                                     │ Postgres DB      │
                                                     │   (pgvector)     │
                                                     └──────────────────┘
```

1) API route calls `getPersona` with a query/idea.
2) `getPersona` performs hybrid search for relevant chunks.
3) Retrieved context is injected into the prompt for the LLM.

---

## 2. Runtime & Tech
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **Database**: Postgres with the `pgvector` extension
- **Vector Search**: Hybrid search (keyword + vector) in `src/lib/rag.ts`
- **LLM**: OpenAI (`gpt-4o-mini` default)
- **Streaming**: AI SDK streaming for `/api/persona`
- **Local Environment**: Docker Compose for Postgres
- **Hosting**: Vercel

---

## 3. Key Modules

### 3.1 `src/lib/clients.ts`
- Initializes singleton clients for Postgres + OpenAI.
- Validates required env vars at module load.

### 3.2 `src/lib/rag.ts`
- Hybrid search: full‑text + vector similarity.
- Filters by persona ids and global knowledge.

### 3.3 `src/lib/personaProvider.ts`
- Reads persona files from `data/personas/<id>/persona.json`.
- Merges static persona context with RAG results.

### 3.4 API Routes
- `/api/stress-test`: persona critique for ideas.
- `/api/idea-refinement`: missing‑info questions + rewrite.
- `/api/copywriter`: platform/format copy generation.
- `/api/persona`: streaming persona Q&A (messages‑based).
- `/api/scorecard`: legacy efficiency scorecard (UI not wired).

---

## 4. Postgres Schema Reference

All indexed content is stored in a single table named `documents`.

| Column             | Type           | Description |
| ------------------ | -------------- | ----------- |
| `id`               | `UUID`         | Primary key. Deterministic ID per chunk. |
| `content`          | `TEXT`         | Raw text content of the chunk. |
| `embedding`        | `VECTOR(1536)` | Embedding vector for the chunk. |
| `metadata`         | `JSONB`        | Metadata (source file, persona ids). |
| `content_tsvector` | `TSVECTOR`     | Full‑text search index. |

