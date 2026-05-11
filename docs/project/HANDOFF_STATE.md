# Handoff State: [2026-05-10] - Incremental RAG & Intelligence Optimization

## Current Phase: Stabilization Path - FULLY OPTIMIZED
**Target Branch**: `feature/alpha/stabilization-path`
**Last Verified State**: 
- **Database**: UTC standardized via `TIMESTAMPTZ`.
- **RAG Engine**: Incremental via SHA-256 Hashing. Zero redundant API calls for unchanged files.
- **Sync Logic**: Protected manual edits. Duplication-free via Name/Cluster heuristics.
- **Hardening**: System files (`.DS_Store`, etc.) are explicitly ignored during ingestion.

## 🏆 Accomplishments
1.  **Incremental Embedding (Epic 21 Extension)**:
    *   Implemented SHA-256 hashing for all persona files.
    *   Added database-lookup logic in `embed.ts` to skip unchanged content.
    *   Preserved deterministic UUID mapping (uuidv5) for conflict resolution.
    *   Verified "Skip" logic: 100% of unchanged files are bypassed in seconds.
2.  **Ingestion Hardening**:
    *   Updated `findAllFiles` to skip hidden/system files (starting with `.`).
    *   Resolved "invalid byte sequence" errors caused by binary macOS metadata files.
3.  **RAG Readiness (Task 20.12)**: Programmatic detection of embeddings per persona is live.
4.  **Cleanup Logic**: Stale documents are automatically purged if their source files are deleted or if chunk counts are reduced.

## 🚀 Immediate Next Steps
- [ ] **Task 21.9**: **Fix RAG Orphanage**: Address the issue where re-created personas skip re-embedding and remain "Untrained" due to hash-matching against old persona IDs.
- [ ] **Task 20.10**: **Main Environment Sync**: Repeat database migrations in the `main` branch environment before the next release cycle.
- [ ] **Task 20.5**: **Inline Management UI**: Implement interactive dropdowns in the Admin table to accelerate cluster management.
- [ ] **Epic 0**: **Railway Bridge**: Begin the platform pivot once the current stabilization is verified by the end-users.

## ⚠️ Known Issues
- **Intelligence Orphanage**: If a persona is deleted and then re-synced from Git, the incremental embedder skips re-embedding because the file content hasn't changed. This leaves the new persona without a linked "Brain" because the existing vectors still point to the old, deleted Numerical ID.
- **Hash-based State**: In production RAG systems, filesystem location should define "Identity," while content hashes define "State." This decouples organizational logic from operational efficiency.
- **Binary Filtering**: Always filter system files (like `.DS_Store`) early in the ingestion pipeline to prevent database driver encoding failures.
- **Processed ID Tracking**: When skipping files in an incremental script, you must still populate the "Processed IDs" set to protect existing records from "Stale Cleanup" logic.
