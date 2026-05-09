# Handoff State: [2026-05-09] - Remote Stabilization & DB Manifest

## Current Phase: Epic 20 (Persona Refactor) - STABLE
**Target Branch**: `feature/alpha/admin-velocity`
**Last Verified State**: Remote infrastructure synchronized and UI hardened against HTML error leaks.

## Accomplishments (Remote Stabilization)
1.  **Remote RAG Setup**: Successfully created the `documents` table and enabled `vector` extension on the remote server using the new portable setup script.
2.  **UI Hardening**: Updated `KnowledgeDropzone.tsx` to handle non-JSON (HTML) error responses gracefully, providing human-readable feedback during server failures.
3.  **Portable Setup Script**: Refactored `scripts/safe-rag-setup.ts` into a standalone CLI tool that accepts any database URL, making it safe for remote environment initialization.
4.  **Audit & Cleanup**: Performed a schema audit of the remote database and cleaned up local audit artifacts.

## 🚀 Database Migration Manifest (for `main`)
To replicate these changes in the `main` environment, the following must be executed in order:

1.  **Persona Normalization**: Run `scripts/db/epic-20-migration.sql` (already in repo) to split the personas table and migrate existing data to the numerical ID system.
2.  **RAG Infrastructure**: Run the portable setup tool against the production database:
    `npx tsx scripts/safe-rag-setup.ts "YOUR_PRODUCTION_POSTGRES_URL"`
    *   *This will ensure the `documents` table and `vector` extension are ready.*
3.  **App Refactor**: Merge the `feature/alpha/admin-velocity` code changes.

## Immediate Next Steps
- [ ] **Task 20.5**: **Inline Management UI**: Replace static badges in `/admin/personas` with interactive inline dropdowns for Cluster and Status.
- [ ] **Task 20.6**: **API Optimization**: Finalize full unification of persona fetching logic and implement selective fetching for performance.

## Technical Learnings
- **The "HTML Leak" Trap**: Remote proxies (Vercel/Cloudflare) often replace 500 errors with HTML pages. Client-side fetchers MUST validate `Content-Type` before calling `.json()` to avoid "Unexpected token <" crashes.
- **Environment Isolation**: Scripts that import `@/lib/clients` are bound to local `.env` validation. Use raw `pg` clients for portable infrastructure tools to avoid boot-up crashes.
