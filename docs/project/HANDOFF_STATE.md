# Handoff State: [2026-05-09] - Epic 20 Tasks 20.3 & 20.4 Stabilized

## Current Phase: Epic 20 (Persona Refactor) - STABLE
**Target Branch**: `feature/alpha/admin-velocity`
**Last Verified State**: Persona Lifecycle & Human-First UI verified and stabilized after deep-dive testing.

## Accomplishments (Task 20.3 & 20.4)
1.  **Dual-ID Infrastructure**:
    *   `PersonaProvider` now robustly supports both Numerical IDs (primary) and Text Slugs (RAG/FS).
    *   Unified data fetching into `getPersonaData` helper to ensure consistency between AI and UI layers.
2.  **Human-First UI**:
    *   Technical IDs (slugs and numbers) are now hidden from all end-user and admin-facing lists/cards.
    *   Identity is now driven by **Name**, **Role**, and **Cluster** for better strategic narrative.
3.  **Persona Lifecycle Hardening**:
    *   **Normalization**: New personas now have URL-safe, filesystem-stable slugs (stripping accents and special characters, e.g., "Andrés" -> "andres-xxxx").
    *   **Auto-Population**: Knowledge ingestion now automatically fills the "Detalles Estratégicos" and Dossier metadata if the uploaded files contain the required info (e.g., `FICHA_TECNICA.md` or `persona.json`).
    *   **Sync Integrity**: Updated `db-sync.ts` to ignore `knowledge/` subfolders, preventing duplicate "phantom" personas in the database.
    *   **Ghost Folder Cleanup**: Deleting a persona via the Admin API now automatically removes its associated folder from the filesystem.
4.  **UI Reactivity & Security**:
    *   Dossier now populates immediately after file upload without page refresh.
    *   Restored `isAdmin` restriction for technical Strategic Depth context in the dossier.

## Immediate Next Steps
- [ ] **Task 20.5**: **Inline Management UI**: Replace static badges in `/admin/personas` with interactive inline dropdowns for Cluster and Status.
- [ ] **Task 20.6**: **API Optimization**: Finalize full unification of persona fetching logic and implement selective fetching for performance.

## Technical Learnings
- **Filesystem Sanitization**: Modern OS handle accents differently; always normalize slugs to ASCII (NFD + accent removal) before using them as directory names to prevent "Ghost Folder" sync bugs.
- **Race Condition in State**: When uploading large files, ensure the UI polling or callback mechanism is robustly linked to the completion of the *embedding* process, not just the *upload* process.
- **RBAC in Shared Components**: When using components like `PersonaDossier` across different routes, always re-validate session roles locally to ensure sensitive "Strategic Depth" remains protected.
