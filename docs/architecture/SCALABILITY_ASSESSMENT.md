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
- **Target State**: Implement a token counting and chunk truncation mechanism in `personaProvider.ts`. Introduce a resilient retry layer with exponential backoff for all LLM calls. Establish global and user-level rate limiting using Upstash/Redis. Consider transitioning to a GraphRAG representation for complex persona knowledge.

### 4. DevOps & Production Guardrails
- **Current State**: Deployments rely entirely on Vercel's basic continuous deployment without an intermediate CI pipeline. There is no automated testing, observability (e.g., Sentry, Datadog), or structured logging. Database schema migrations rely on manual script execution.
- **Target State**: Introduce GitHub Actions for CI (linting, type-checking, tests). Implement structured logging (Pino) and error tracking (Sentry). Migrate database management to Drizzle or Prisma migrations.

## Prioritized Remediation Strategy
1. **Critical**: Resolve the Postgres connection pool bottleneck (`max: 1`) and implement API rate limiting.
2. **High**: Refactor the Frontend monolithic component and introduce streaming for AI operations to fix UX blocking.
3. **High**: Implement token counting and retry logic for OpenAI API integrations.
4. **Medium**: Move local persona file reading to DB/Cache and establish CI pipelines.
