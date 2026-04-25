# Product Backlog & Epics

## Epic 0: Platform Pivot & Railway Bridge (Priority: Immediate)
**Owner**: DevOps & Backend
*Goal: Move high-latency AI logic away from Vercel to eliminate timeout constraints and prepare for the Intelligence Factory.*
- [ ] **Task 0.1**: Set up a Railway-hosted Node.js environment with shared access to the production Postgres/Redis.
- [ ] **Task 0.2**: Migrate `/api/stress-test` and `/api/persona` (and associated RAG logic) to the Railway container.
- [ ] **Task 0.3**: Configure Vercel as a "Thin Client" that proxies complex AI requests to the Railway backend via a secure private API.

## Epic 1: Infrastructure Resilience & Database Scaling (Critical) [DONE]
**Owner**: DevOps & Backend
- [x] **Task 1.1**: Update `src/lib/clients.ts` to increase the Postgres connection pool size. [DONE]
- [x] **Task 1.2**: Implement rate limiting for all API routes using Upstash/Redis. [DONE]
- [x] **Task 1.3**: Set up GitHub Actions CI pipeline. [DONE]
- [x] **Task 1.4**: Implement structured logging (Pino). [DONE]

## Epic 2: Frontend De-Monolithization & UX Refinement (High)
**Owner**: Frontend & UX/UI
- [x] **Task 2.1**: Refactor `src/app/(app)/page.tsx` into smaller components. [DONE]
- [x] **Task 2.2**: Migrate static data fetching to Server Components. [DONE]
- [x] **Task 2.3**: Implement `Suspense` and streaming states. [DONE]
- [ ] **Task 2.4**: Introduce robust Error Boundaries for isolated component failures.

## Epic 3: AI Pipeline Optimization & LLMOps Guardrails (High)
**Owner**: AI Engineer & LLMOps
- [ ] **Task 3.1**: Implement a token counting utility (`tiktoken`).
- [ ] **Task 3.2**: Add exponential backoff and retry logic for OpenAI.
- [ ] **Task 3.3**: Refactor hybrid search into a unified SQL query.
- [ ] **Task 3.4**: Optimize ingestion script for concurrency.

## Epic 4: Data Layer Caching & Storage (Medium) [DONE]
**Owner**: Backend
- [x] **Task 4.1**: Migrate persona data to the database. [DONE]
- [x] **Task 4.2**: Implement caching for AI queries (using Redis). [DONE]

## Epic 5: The Admin Intelligence Dashboard (The Intelligence Factory)
**Owner**: AI Engineer & Backend & UX/UI
*Goal: Provide a web-based UI for managing personas and uploading knowledge, eliminating the need for manual scripts.*
- [ ] **Task 5.1**: Build the Admin Persona Management UI (`/admin/personas`) to list, search, and filter personas.
- [ ] **Task 5.2**: Implement the "Persona Editor" form to modify metadata (Name, Role, Cluster, Pains) directly in the DB.
- [ ] **Task 5.3**: Build the "Knowledge Dropzone" for browser-based file uploads (PDF/TXT) tied to specific personas.
- [ ] **Task 5.4**: Create the `/api/admin/ingest` pipeline to trigger chunking and embedding from the UI.
- [ ] **Task 5.5**: Add an "Ingestion Status" tracker to show RAG processing progress.

## Epic 6: Relational Intelligence (GraphRAG Evolution)
**Owner**: AI Engineer & Backend
- [ ] **Task 6.1**: Implement Graph Traversal logic.
- [ ] **Task 6.2**: Design and implement the Graph Schema in Postgres.
- [ ] **Task 6.3**: Refactor `src/lib/rag.ts` to include Graph Traversal.
- [ ] **Task 6.4**: Implement Citation Mapping.

## Epic 7: Iterative Strategy Co-Pilot & Integrity Scoring
**Owner**: Backend & AI Engineer & UX_UI
- [ ] **Task 7.1**: Implement a Stateful Session Database (`conversations` and `messages`).
- [ ] **Task 7.2**: Develop the "Critical Friend" logic (Integrity Guardrails).
- [ ] **Task 7.3**: Build the "Progress to Market Fit" UI chart.
- [ ] **Task 7.4**: Implement "Strategic Pivot" logic.

## Epic 8: Persona Clustering & Permissions (High)
**Owner**: Backend & UX/UI
- [ ] **Task 8.1**: Update schema to support "Cluster" labels as a first-class citizen in the DB.
- [ ] **Task 8.2**: Refactor `src/components/PersonaSelect.tsx` to display grouped personas (Clustered View).
- [ ] **Task 8.3**: Implement a many-to-many permission system (`user_persona_access`).
- [ ] **Task 8.4**: Update API to return filtered and grouped persona data.

## Epic 9: Deterministic Scoring Engine (DSE) (High) [DONE]
**Owner**: AI Engineer & Backend & UX/UI
- [x] **Task 9.1**: Define Micro-Agent Scorer prompts. [DONE]
- [x] **Task 9.2**: Implement parallel processing pipeline. [DONE]
- [x] **Task 9.3**: Develop weighted scoring utility in TypeScript. [DONE]
- [x] **Task 9.4**: Implement "Reasoning Window" in the UI. [DONE]
- [x] **Task 9.5**: Build "Consistency Anchor" using Redis caching. [DONE]
