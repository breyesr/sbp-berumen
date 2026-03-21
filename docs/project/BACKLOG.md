# Product Backlog & Epics

## Epic 1: Infrastructure Resilience & Database Scaling (Critical)
**Owner**: DevOps & Backend
- [ ] **Task 1.1**: Update `src/lib/clients.ts` to increase the Postgres connection pool size and configure connection proxying (e.g., Supabase/PgBouncer) for serverless environments.
- [ ] **Task 1.2**: Implement rate limiting for all API routes (especially AI endpoints) using Upstash/Redis to prevent abuse and cost overruns.
- [ ] **Task 1.3**: Set up GitHub Actions CI pipeline for automated linting, testing, and type checking before deployment.
- [ ] **Task 1.4**: Implement structured logging (e.g., Pino) and error tracking (e.g., Sentry) across the backend and edge functions.

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
