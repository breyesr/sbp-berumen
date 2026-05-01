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

## Epic 5: The Admin Intelligence Dashboard (The Intelligence Factory) [DONE]
**Owner**: AI Engineer & Backend & UX/UI
*Goal: Provide a web-based UI for managing personas and uploading knowledge, eliminating the need for manual scripts.*
- [x] **Task 5.1**: Build the Admin Persona Management UI (`/admin/personas`) to list, search, and filter personas. [DONE]
- [x] **Task 5.2**: Implement the "Persona Editor" form to modify metadata (Name, Role, Cluster, Pains) directly in the DB. [DONE]
- [x] **Task 5.3**: Build the "Knowledge Dropzone" for browser-based file uploads (PDF/TXT) tied to specific personas. [DONE]
- [x] **Task 5.4**: Create the `/api/admin/ingest` pipeline to trigger chunking and embedding from the UI. [DONE]
- [ ] **Task 5.5**: Add an "Ingestion Status" tracker to show RAG processing progress.
- [ ] **Task 5.6**: Implement "Identity Synthesis": Automatically update persona metadata (synthesis, pains, goals) after a knowledge file is uploaded.


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

## Epic 8: Persona Clustering & Layout (High) [DONE]
**Owner**: Backend & UX/UI
- [x] **Task 8.1**: Update schema to support "Cluster" labels as a first-class citizen in the DB. [DONE]
- [x] **Task 8.2**: Refactor `src/components/PersonaSelect.tsx` to display grouped personas (Clustered View). [DONE]
- [x] **Task 8.4**: Update API to return filtered and grouped persona data. [DONE]

## Epic 9: Deterministic Scoring Engine (DSE) (High) [DONE]
**Owner**: AI Engineer & Backend & UX/UI
- [x] **Task 9.1**: Define Micro-Agent Scorer prompts. [DONE]
- [x] **Task 9.2**: Implement parallel processing pipeline. [DONE]
- [x] **Task 9.3**: Develop weighted scoring utility in TypeScript. [DONE]
- [x] **Task 9.4**: Implement "Reasoning Window" in the UI. [DONE]
- [x] **Task 9.5**: Build "Consistency Anchor" using Redis caching. [DONE]

## Epic 10: Multi-Tenant Cluster Permissions (High) [DONE]
**Owner**: Backend & UX/UI
*Goal: Control user access to personas at the cluster level to support B2B and multi-team environments.*
- [x] **Task 10.1**: Create the `user_cluster_access` junction table in Postgres. [DONE]
- [x] **Task 10.2**: Update the Admin Users UI (`/admin/users`) to include an "Access Control" panel for cluster assignment. [DONE]
- [x] **Task 10.3**: Implement Authorization Middleware to validate persona access based on user-cluster entitlements. [DONE]
- [x] **Task 10.4**: Refactor `GET /api/personas` to return only authorized personas based on the session's clusters. [DONE]
- [x] **Task 10.5**: Implement Super-Admin "Global View" bypass for unrestricted access. [DONE]

## Epic 11: Optimized Copywriter Engine & UX (High Priority) [DONE]
**Owner**: Lead & Backend
- [x] **Task 11.1**: Migrate Copywriter logic to `streamObject` (AI SDK). [DONE]
- [x] **Task 11.2**: Refactor the Copywriter results view to support incremental streaming. [DONE]
- [x] **Task 11.3**: Transform Copywriter into the **Collapsible Intelligence Factory** architecture. [DONE]
    - [x] Replicate collapsible step state management.
    - [x] Integrate `PersonaCard` grid for selection.
    - [x] Group results by Platform and optimize card sizing.
    - [x] Standardize with "Factory Floor" aesthetic and Intelligence Assistant tooltips.

## Epic 12: Unified Strategic Access (Dossier Integration) [DONE]
**Owner**: UX/UI & Frontend
*Goal: Provide immediate access to persona intelligence across the entire platform.*
- [x] **Task 12.1**: Implement a "View Persona Dossier" button next to the persona selector in Stress Test and Copywriter pages. [DONE]
- [x] **Task 12.2**: Refactor the `PersonaDossier` into a shared UI component that adapts to user vs. admin context. [DONE]

## Epic 13: Advanced Cluster Navigation UX [DONE]
**Owner**: UX/UI
*Goal: Simplify navigation when multiple clusters are present.*
- [x] **Task 13.1**: Upgrade `PersonaSelect` to use a searchable combobox or grouped tab interface. [DONE]
- [x] **Task 13.2**: Add visual "Cluster Context" indicators in the main workspace. [DONE]

## Epic 14: Collapsible Intelligence Factory (High Priority) [DONE]
**Owner**: UX/UI & Frontend
*Goal: Transform the Stress Test into a structured, step-by-step collapsible workflow to reduce cognitive load.*
- [x] **Task 14.1**: Develop `CollapsibleStep` wrapper component with Framer Motion height animations and summary badges. [DONE]
- [x] **Task 14.2**: Implement `PersonaCard` ("Choose Your Fighter") grid with single-click selection and dossier integration. [DONE]
- [x] **Task 14.3**: Refactor `StressTestClient` state management to handle `currentStep` logic ('identity' | 'strategy' | 'results' | 'refinement'). [DONE]
- [x] **Task 14.4**: Integrate "Intelligence Assistant" tooltips (Expectation, Mechanism, Example) for all strategy input fields. [DONE]
- [x] **Task 14.5**: Implement auto-expansion and scroll-into-view logic for Section 3 (Results) triggered by streaming onset. [DONE]
- [x] **Task 14.6**: Wrap `RefinementPanel` in the collapsible architecture as the final step. [DONE]

## Epic 15: The Intelligence Matrix (Copywriter UX Refactor) [DONE]
**Owner**: UX/UI & Frontend
*Goal: Solve the "format selection nightmare" by shifting from a linear list to a high-density, context-aware tabbed matrix.*
- [x] **Task 15.1**: Implement "Auto-Select Primary" logic: Toggling a platform ON automatically selects its first format. [DONE]
- [x] **Task 15.2**: Build the `PlatformTabSystem`: A horizontal, icon-driven tab bar for selected networks in Section 2. [DONE]
- [x] **Task 15.3**: Develop the `FormatChipGrid`: A 2/3-column grid of compact pills with platform-specific branding (colors/icons). [DONE]
- [x] **Task 15.4**: Add "Bulk Matrix Controls": A "Select All" toggle per platform tab to reduce click-fatigue. [DONE]
- [x] **Task 15.5**: Implement "Coverage Badges" on Platform Cards to show selected/total formats at a glance. [DONE]
- [x] **Task 15.6**: Add a sticky "Factory Ledger" summary footer to Section 2 for immediate feedback on generation scale. [DONE]

