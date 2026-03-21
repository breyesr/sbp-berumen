# Product Backlog & Epics

## Epic 1: Infrastructure Resilience & Database Scaling (Critical)
**Owner**: DevOps & Backend
- [x] **Task 1.1**: Update `src/lib/clients.ts` to increase the Postgres connection pool size and configure connection proxying (e.g., Supabase/PgBouncer) for serverless environments. [DONE: Increased pool size to 10 (env-configurable), added SSL, and tuned timeouts]
- [x] **Task 1.2**: Implement rate limiting for all API routes (especially AI endpoints) using Upstash/Redis to prevent abuse and cost overruns. [DONE: Implemented global and AI-specific limiters in Middleware using Upstash/Redis]
- [x] **Task 1.3**: Set up GitHub Actions CI pipeline for automated linting, testing, and type checking before deployment. [DONE: Created .github/workflows/ci.yml and resolved 19+ pre-existing type errors]
- [x] **Task 1.4**: Implement structured logging (e.g., Pino) and error tracking (e.g., Sentry) across the backend and edge functions. [DONE: Implemented structured JSON logging with Pino, optimized for Vercel/Edge]

## Epic 2: Frontend De-Monolithization & UX Refinement (High)
**Owner**: Frontend & UX/UI
- [ ] **Task 2.1**: Refactor `src/app/(app)/page.tsx` into smaller, focused components (`StressTestForm`, `ResultsPanel`, `RefinementPanel`).
- [ ] **Task 2.2**: Migrate static data fetching (Personas, Industries) from `useEffect` to Server Components to improve FCP.
- [ ] **Task 2.3**: Implement `Suspense` boundaries and streaming states for long-running AI API calls to improve perceived performance and eliminate UI blocking.
- [ ] **Task 2.4**: Introduce robust Error Boundaries for isolated component failures rather than entire page crashes.

## Epic 3: AI Pipeline Optimization & LLMOps Guardrails (High)
**Owner**: AI Engineer & LLMOps
- [ ] **Task 3.1**: Implement a token counting utility (`tiktoken`) to ensure injected RAG context does not exceed model context windows in `personaProvider.ts`.
- [ ] **Task 3.2**: Add exponential backoff and retry logic for OpenAI API calls to handle 429 and 500 errors gracefully.
- [ ] **Task 3.3**: Refactor the hybrid search mechanism in `src/lib/rag.ts` into a unified SQL query to reduce database roundtrips.
- [ ] **Task 3.4**: Optimize the ingestion script (`embed.ts`) to use batched and concurrent processing with rate-limit awareness.

## Epic 4: Data Layer Caching & Storage (Medium)
**Owner**: Backend
- [ ] **Task 4.1**: Migrate persona data reading from the local filesystem (`data/personas`) to the database or a Redis caching layer to eliminate synchronous I/O bottlenecks.
- [ ] **Task 4.2**: Introduce a caching mechanism for frequent AI queries (e.g., semantic caching) to reduce redundant OpenAI calls.

## Epic 5: Dynamic Persona Generation (The "Self-Service" Layer)
**Owner**: Backend & AI Engineer
*Dependency: Task 4.1 (DB Migration)*
- [ ] **Task 5.1**: Develop an Ingestion Portal UI for secure file uploads (PDF, Word, TXT, JSON).
- [ ] **Task 5.2**: Implement an asynchronous parsing and embedding pipeline to handle large files without blocking the main thread.
- [ ] **Task 5.3**: Develop Persona Synthesis logic to automatically extract Name, Voice, and Beliefs from uploaded content.
- [ ] **Task 5.4**: Implement UI status tracking for the indexing and embedding lifecycle.

## Epic 6: Relational Intelligence (GraphRAG Evolution)
**Owner**: AI Engineer & Backend
*Dependency: Epic 5 (Ingestion)*
- [ ] **Task 6.1**: Implement a Relationship Extraction pipeline to identify entities and connections during ingestion.
- [ ] **Task 6.2**: Design and implement the Graph Schema in Postgres to store relational mapping.
- [ ] **Task 6.3**: Refactor `src/lib/rag.ts` to include Graph Traversal in the retrieval logic.
- [ ] **Task 6.4**: Implement Citation Mapping to trace AI reasoning back to specific document relationship nodes.

## Epic 7: Iterative Strategy Co-Pilot & Integrity Scoring
**Owner**: Backend & AI Engineer & UX_UI
*Dependency: Task 2.1 (Refactor) and Task 2.3 (Streaming)*
- [ ] **Task 7.1**: Implement a Stateful Session Database (`conversations` and `messages` tables) to store "Idea Evolution" history.
- [ ] **Task 7.2**: Develop the "Critical Friend" logic (Integrity Guardrails) with internal Chain-of-Thought (CoT) and Audit Agent review.
- [ ] **Task 7.3**: Build the "Progress to Market Fit" UI chart to visualize score trends over time.
- [ ] **Task 7.4**: Implement "Strategic Pivot" logic to offer proactive guidance instead of just passive critiques.
