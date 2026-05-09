# Handoff State: [2026-05-09] - Epic 21 Phase 1 Stable: Sync Integrity Established

## Current Phase: Epic 21 (Sync Integrity) - STABLE / IN REVIEW
**Target Branch**: `feature/alpha/epic-21-sync-integrity` (Merged to `staging`)
**Last Verified State**: Local and Remote databases updated with `last_synced_at` column. Intelligent Sync logic verified to protect manual UI edits (Name, Role, Cluster) from being overwritten.

## 🏆 Accomplishments (Epic 21 Phase 1)
1.  **Schema Migration**: Added `last_synced_at` to the `personas` table on local and production.
2.  **Intelligent Sync**: Refactored `db-sync.ts` to implement the `wasEditedByHuman` check (`updated_at > last_synced_at`).
3.  **Conflict Protection**: Verified that "Sincronizar DB" skips metadata updates for personas edited via the Admin UI.
4.  **Remote Stability**: Verified remote schema parity via `pg_dump` audit and successfully applied the migration to production.

## 🛠️ Identified Issues & Next Steps (Epic 21 Phase 2)
- [ ] **Intelligence Protection**: Expand `wasEditedByHuman` logic to the `persona_intelligence` table to protect Pains, Goals, and other JSON metadata. Currently, only the "Identity" table is protected.
- [ ] **UTC Standardization**: Update migration and sync logic to use `TIMESTAMP WITH TIME ZONE` and UTC strings to eliminate server/local timezone discrepancies.
- [ ] **Sync Audit UI**: Add feedback to the Admin UI to show which personas were skipped due to human edits and which files failed validation.

## 🚀 Critical Dependencies for CI Automation
- [ ] **Task 20.9 (High)**: **RAG Metadata Alignment**: Update `embed.ts` to include numerical `persona_id`. This is mandatory before CI automation to ensure the AI brain links correctly to the new database IDs.
- [ ] **Task 20.11 (Medium)**: **Automated CI Embedding**: Finalize the "Push-to-Train" workflow once Phase 2 and 20.9 are verified.

## Technical Learnings
- **Human-First Precedence**: In conflict scenarios between Git and the Database, the Database (Human UI) must be the Source of Truth for metadata, while Git remains the source for Knowledge files.
- **Sync Isolation**: The current sync script skips `knowledge/` subfolders by design; `persona.json` MUST live in the persona root folder to be detected.

