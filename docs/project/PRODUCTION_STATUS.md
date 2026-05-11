# Live Production Status

## Environment Summary
- **Current Stack**: Next.js 16, Postgres with pgvector, Vercel Node.js Functions, OpenAI API, Upstash Redis.
- **Status**: **STABLE & FEATURE-COMPLETE (Production Release Epic 20/21)**

## Latest Deployments
- **Epic 20 & 21: Production Release & Identity Refactor (May 11, 2026)**:
    - **Numerical ID Migration**: Successfully migrated personas from text-slugs to SERIAL IDs.
    - **Database Normalization**: Split `personas` into thin/fat tables (`personas` and `persona_intelligence`).
    - **UTC Standardization**: Standardized all production timestamps to `TIMESTAMPTZ`.
    - **RAG Infrastructure**: Initialized `documents` table with HNSW vector indexes in production.
    - **Persona Cleanup**: Streamlined production to 7 core personas with 534 verified knowledge chunks.
- **Epic 21: Incremental RAG & Intelligence Optimization (May 10, 2026)**:
    - **Hash-Based Sync**: Implemented SHA-256 content hashing in `embed.ts`.
    - **System Hardening**: Integrated filters to ignore hidden/binary files.

## Known Active Issues
- **Intelligence Orphanage (Task 21.9)**: The incremental embedder skips re-embedding if file hashes match, even if the persona ID has changed. While production is currently clean after a manual sync, the underlying logic bug remains to be fixed in the next cycle.

## Observability
- **Monitoring**: Structured JSON Logs (Pino).
- **CI**: GitHub Actions CI active on all PRs.
