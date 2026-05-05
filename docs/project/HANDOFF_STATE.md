# Handoff State: IntelAgent Scalability & Continuous Execution

## Session Summary (May 4, 2026)
- **Primary Objective**: Investigate and resolve persona data loss during database synchronization.
- **Key Findings**: 
    - The `syncPersonasFromFilesystem` utility in `src/lib/db-sync.ts` uses an unconditional `ON CONFLICT (id) DO UPDATE`.
    - Manual UI edits are overwritten by the filesystem state (JSON/Markdown) because the system lacks a way to distinguish between "last synced" and "last human edited".
- **Proposed Solution**: "Intelligent Sync" strategy (see `BACKLOG.md` Epic 21).

## Current Status
- **Epic 21** added to `BACKLOG.md` with detailed technical strategy.
- **Root Cause Confirmed**: `src/lib/db-sync.ts` logic identified.

## Next Steps for Incoming Team
1. **Database Migration**: Create and run a SQL migration script to add `last_synced_at` (TIMESTAMP) to the `personas` table.
2. **Logic Refactor**: Modify `src/lib/db-sync.ts` to implement the comparison logic: `updated_at > last_synced_at`.
3. **Merge Implementation**: Update the `UPDATE` query to be conditional based on the "human edit" detection.
4. **Verification**: 
    - Edit a persona via the Admin UI.
    - Click "Sincronizar DB".
    - Verify that the manual edit persists while other (file-based) context updates correctly.

## Active Constraints
- **Branching**: Ensure work happens on a feature branch (e.g., `feature/alpha/persona-sync-fix`) from `staging`.
- **Database**: Human approval required for schema changes (Task 21.1).
- **Verification**: `npm run build` must pass before PR.
