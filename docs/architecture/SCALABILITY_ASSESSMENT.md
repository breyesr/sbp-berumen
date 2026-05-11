# Scalability Assessment Report & Architecture State

## Executive Summary
This report details the cross-functional scalability audit for the Synthetic Buyer Personas platform. The platform is highly constrained by a monolithic frontend architecture, severe database connection pooling bottlenecks, synchronous disk I/O, and missing production guardrails. Immediate remediation is required to ensure stability under load and maintain predictable operational costs (especially concerning LLM API calls).

## Current State vs. Target Architecture

### 1. Backend & Database Architecture
- **Current State**: The Postgres database connection pool (`src/lib/clients.ts`) is hardcoded to `max: 1`. This leads to severe queuing and latency under concurrent load. Persona data (`data/personas`) is read synchronously from the disk on every request, creating an I/O bottleneck. RAG search uses separate SQL queries (FTS + Vector) merged in-memory.
- **Target State**: Implement PgBouncer or a serverless connection proxy to allow multiple pooled connections. Migrate persona data into the database or introduce a caching layer (Redis). Refactor RAG to execute a unified SQL query for hybrid search.

### 2. Frontend Performance & Client Architecture
- **Current State**: The `HomePage` (`src/app/(app)/page.tsx`) is a massive monolith (>700 lines) entirely marked as `use client`. Data fetching is handled via `useEffect` after initial render, degrading Time to Interactive (TTI) and First Contentful Paint (FCP). There is no progressive streaming of AI results, leading to a perceived frozen state.
- **Target State**: Decompose `HomePage` into localized client and server components. Move initial data fetching (Personas, Industries) to React Server Components (RSC) and pass down as props. Implement `React.Suspense` boundaries and streaming UI for AI generation.

### 3. AI & LLMOps Reliability
- **Current State**: Implementations rely heavily on Hybrid RAG (Keyword + Vector) rather than true GraphRAG. Crucially, there is no token management during context injection, leading to potential context-window exhaustion. There are no rate-limiting or exponential backoff mechanisms to protect against OpenAI 429 errors or unbounded looping.
- **Optimization (May 2026)**: Implemented **Incremental RAG Embedding** using SHA-256 hashing. This reduces LLM API calls by 100% for unchanged knowledge files and significantly accelerates the "Intelligence Sync" pipeline.
- **Target State**: Transition to a **GraphRAG** representation for complex persona knowledge. 
 Implement a Relationship Extraction pipeline to identify entities and connections during data ingestion. Transition from stateless API calls to a **Stateful Dialogue** model using a dedicated `conversations` table in Postgres. Implement token counting, chunk truncation, and resilient retries with exponential backoff.

### 4. DevOps & Production Guardrails
- **Current State**: Deployments rely entirely on Vercel's basic continuous deployment without an intermediate CI pipeline. There is no automated testing, observability (e.g., Sentry, Datadog), or structured logging. Database schema migrations rely on manual script execution.
- **Target State**: Introduce GitHub Actions for CI (linting, type-checking, tests). Implement structured logging (Pino) and error tracking (Sentry). Migrate database management to Drizzle or Prisma migrations.

## Prioritized Remediation Strategy
1. **Critical**: Resolve the Postgres connection pool bottleneck (`max: 1`) and implement API rate limiting. **[COMPLETE]**
2. **Critical**: Migrate local persona file reading (Task 4.1) to Postgres to enable user-generated content and eliminate synchronous I/O.
3. **High**: Refactor the Frontend monolithic component (Task 2.1) and introduce streaming for AI operations (Task 2.3) to fix UX blocking and support the Co-Pilot interface.
4. **High**: Implement token counting (Task 3.1) and retry logic (Task 3.2) for OpenAI API integrations.
5. **Medium**: Establish CI pipelines and production observability (Sentry/Pino). **[PARTIALLY COMPLETE: Pino & GitHub Actions Setup]**

## Future Architectural Evolution
The next phase of the architecture focuses on **Relational Intelligence**, **Deterministic Scoring**, and **Strategy Co-Pilot** functionality. This shift involves:
- **Graph-Based Ingestion**: Automatically mapping relationships between research data points upon upload.
- **Micro-Agent Architecture**: Decomposing large evaluation prompts into specialized, isolated scorers (Value, Feasibility, Lens) to eliminate LLM bias and improve consistency.
- **Deterministic Math Engine**: Moving scoring calculations from LLM prompts to hard-coded backend logic for objective result verification.
- **Stateful Interaction Models**: Maintaining session history for multi-turn persona-user collaboration.
- **Multi-Tenant Access Control**: Implementing "Persona Clustering" and granular user-level permissions to support multi-client environments.
- **Adversarial Integrity Guardrails**: Implementing "Audit Agent" patterns to ensure scoring remains objective and data-backed.
