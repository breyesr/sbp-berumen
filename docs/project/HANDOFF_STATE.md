# Handoff State: [2026-05-09] - Stabilization Complete: Deployment Bridge & Human-First UI

## Current Phase: Epic 20 (Persona Refactor) - STABLE
**Target Branch**: `feature/alpha/admin-velocity`
**Last Verified State**: Full Persona Lifecycle stabilized across Local and Remote (Vercel) environments.

## 🏆 Accomplishments (Tasks 20.3 & 20.4 Recap)
1.  **Dual-ID & Normalization**: 
    *   Completed the migration from Text Slugs to **Numerical IDs** in the database.
    *   Unified all persona fetching through `getPersonaData` in `personaProvider.ts`.
2.  **Human-First UI (UX Refinement)**:
    *   Removed all visible technical IDs (slugs and numbers) from Admin and User lists.
    *   Identity is now driven purely by Strategic Metadata (**Name, Role, Cluster**).
3.  **Vercel-Safe Deployment Bridge**:
    *   Implemented **Environment-Aware Ingestion**: The app now automatically skips forbidden filesystem writes on Vercel while preserving them on local dev.
    *   Verified the **"Git-to-DB" workflow**: Users can add personas by pushing folders to GitHub and clicking "Sync DB" on the remote server.
4.  **Sync Logic Hardening**:
    *   Updated `db-sync.ts` with **Name-Agnostic discovery**, correctly identifying strategic context from any `.md` file (e.g., `FICHA_TECNICA.md`).
    *   Fixed the "Duplicate Sync" bug by ignoring `knowledge/` subfolders.
5.  **Data Integrity & Recovery**:
    *   Initialized the missing `documents` table in the remote database.
    *   Created a **Portable RAG Setup Tool** (`scripts/safe-rag-setup.ts`) for easy environment bootstrapping.

## 🚀 The "Vercel Era" Workflow (Standard Operating Procedure)
Until the Railway migration (Epic 0) is complete, use this workflow to avoid Vercel timeouts and filesystem locks:
- **Identity Sync**: 
  1. Add persona folder to git locally.
  2. Commit & Push to GitHub.
  3. Go to `/admin/personas` on the remote server and click **"Sincronizar DB"**.
- **AI Brain (RAG) Training**:
  - Run the embed script locally against the production URL:
    `npx tsx scripts/db/embed.ts "YOUR_PRODUCTION_POSTGRES_URL"`

## Immediate Next Steps
- [ ] **Task 20.5**: **Inline Management UI**: Implement interactive dropdowns for Cluster and Status in the Admin table to boost management speed.
- [ ] **Task 20.11**: **Automated CI Embedding**: Configure GitHub Actions to auto-run `npm run embed` on pushes to restore the "Push-to-Train" experience.

## Technical Learnings
- **Filesystem ephemerality**: Serverless environments (Vercel) are strictly stateless. Any feature requiring persistence must use the Database as the primary write target.
- **HTML Leak Protection**: Always validate API response `Content-Type` in the frontend to handle "Status 500" HTML error pages gracefully.
