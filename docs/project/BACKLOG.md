# Product Backlog & Epics

## Epic 0: Platform Pivot & Railway Bridge (Priority: Immediate)
**Owner**: DevOps & Backend
*Goal: Move high-latency AI logic away from Vercel to eliminate timeout constraints and prepare for the Intelligence Factory.*
- [ ] **Task 0.1**: Set up a Railway-hosted Node.js environment with shared access to the production Postgres/Redis.
- [ ] **Task 0.2**: Migrate `/api/stress-test` and `/api/persona` (and associated RAG logic) to the Railway container.
- [ ] **Task 0.3**: Configure Vercel as a "Thin Client" that proxies complex AI requests to the Railway backend via a secure private API.

## Epic 1: Infrastructure Resilience & Database Scaling (Critical)
**Owner**: DevOps & Backend
- [x] **Task 1.1**: Update `src/lib/clients.ts` to increase the Postgres connection pool size and configure connection proxying (e.g., Supabase/PgBouncer) for serverless environments. [DONE: Increased pool size to 10 (env-configurable), added SSL, and tuned timeouts]
- [x] **Task 1.2**: Implement rate limiting for all API routes (especially AI endpoints) using Upstash/Redis to prevent abuse and cost overruns. [DONE: Implemented global and AI-specific limiters in Middleware using Upstash/Redis]
- [x] **Task 1.3**: Set up GitHub Actions CI pipeline for automated linting, testing, and type checking before deployment. [DONE: Created .github/workflows/ci.yml and resolved 19+ pre-existing type errors]
- [x] **Task 1.4**: Implement structured logging (e.g., Pino) and error tracking (e.g., Sentry) across the backend and edge functions. [DONE: Implemented structured JSON logging with Pino, optimized for Vercel/Edge]

## Epic 2: Frontend De-Monolithization & UX Refinement (High)
**Owner**: Frontend & UX/UI
- [x] **Task 2.1**: Refactor `src/app/(app)/page.tsx` into smaller, focused components (`StressTestForm`, `ResultsPanel`, `RefinementPanel`). [DONE: Extracted components to src/components/stress-test/]
- [x] **Task 2.2**: Migrate static data fetching (Personas, Industries) from `useEffect` to Server Components to improve FCP. [DONE: HomePage is now a Server Component fetching initial data]
- [x] **Task 2.3**: Implement `Suspense` boundaries and streaming states for long-running AI API calls to improve perceived performance and eliminate UI blocking. [DONE: Implemented streamObject on backend and experimental_useObject on frontend]
- [ ] **Task 2.4**: Introduce robust Error Boundaries for isolated component failures rather than entire page crashes.

## Epic 3: AI Pipeline Optimization & LLMOps Guardrails (High)
**Owner**: AI Engineer & LLMOps
- [ ] **Task 3.1**: Implement a token counting utility (`tiktoken`) to ensure injected RAG context does not exceed model context windows in `personaProvider.ts`.
- [ ] **Task 3.2**: Add exponential backoff and retry logic for OpenAI API calls to handle 429 and 500 errors gracefully.
- [ ] **Task 3.3**: Refactor the hybrid search mechanism in `src/lib/rag.ts` into a unified SQL query to reduce database roundtrips.
- [ ] **Task 3.4**: Optimize the ingestion script (`embed.ts`) to use batched and concurrent processing with rate-limit awareness.

## Epic 4: Data Layer Caching & Storage (Medium)
**Owner**: Backend
- [x] **Task 4.1**: Migrate persona data reading from the local filesystem (`data/personas`) to the database or a Redis caching layer to eliminate synchronous I/O bottlenecks. [DONE: Created personas table, migration script, and refactored provider to prioritize DB]
- [ ] **Task 4.2**: Introduce a caching mechanism for frequent AI queries (e.g., semantic caching) to reduce redundant OpenAI calls.

## Epic 5: The "Side-Loading" Ingestion Pipeline (The Intelligence Factory)
**Owner**: AI Engineer & Backend
*Strategy: Separate heavy document processing from the web UI to ensure reliability and cost-control.*
- [ ] **Task 5.1**: Develop a standalone "Ingestion Script" (Python/Node) to process raw transcripts into "Behavioral Nodes" (Beliefs, Tone, Logic).
- [ ] **Task 5.2**: Implement the "Entity Extraction" logic to automatically map relationships between transcript data points (pre-populating the Graph).
- [ ] **Task 5.3**: Create a "Side-Loading" utility to batch-upload processed Persona Knowledge into the production `documents` and `entities` tables.
- [ ] **Task 5.4**: Build a "Persona Validator" UI (Admin-only) to review and approve synthesized persona beliefs before they go live.

## Epic 6: Relational Intelligence (GraphRAG Evolution)
**Owner**: AI Engineer & Backend
*Dependency: Epic 0 (Railway) and Epic 5 (Side-Loading)*
- [ ] **Task 6.1**: Implement Graph Traversal logic in the Railway-hosted RAG service to fetch "Connected Ideas" instead of just similar text.
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

## Epic 8: Persona Clustering & Multi-Tenant Access (High)
**Owner**: Backend & UX/UI & Admin
*Goal: Organize personas into logical clusters (e.g., "Student Personas") and control access at the user level.*
- [ ] **Task 8.1**: Update the database schema and persona metadata to support "Cluster" labels (e.g., `cluster: "Marketing"`).
- [ ] **Task 8.2**: Refactor `src/components/PersonaSelect.tsx` to display personas in a hierarchical/grouped dropdown structure.
- [ ] **Task 8.3**: Implement a many-to-many permission system (`user_persona_access`) to restrict persona visibility based on the user's account.
- [ ] **Task 8.4**: Update the `GET /api/personas` endpoint to return filtered and grouped persona data based on the authenticated session.
- [ ] **Task 8.5**: Extend the `/admin/users` UI to allow administrators to manage cluster and persona assignments for specific users.

## Epic 9: Deterministic Scoring Engine (DSE) (High) [DONE]
**Owner**: AI Engineer & Backend & UX/UI
*Goal: Transition from subjective LLM vibes to a data-backed, weighted mathematical scoring model.*
- [x] **Task 9.1**: Define the specialized Micro-Agent Scorer prompts (Value Advocate, Feasibility/Goal, Lens Scorer). [DONE]
- [x] **Task 9.2**: Implement a parallel processing pipeline in the backend to trigger and aggregate micro-agent results within Vercel timeout limits. [DONE]
- [x] **Task 9.3**: Develop the weighted scoring utility in TypeScript (Value 50%, Feasibility 30%, Focus 20%) to move math out of the LLM. [DONE]
- [x] **Task 9.4**: Implement a "Reasoning Window" in the UI to display the specific logic and justification provided by each micro-agent. [DONE]
- [x] **Task 9.5**: Build a "Consistency Anchor" using Semantic Caching to ensure identical scores across different user accounts for the same input. [DONE]
