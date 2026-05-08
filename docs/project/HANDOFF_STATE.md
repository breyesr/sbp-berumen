# Handoff State: [2026-05-08] - Epic 20 Task 20.1 & 20.2 Completion

## Current Phase: Epic 20 (Persona Refactor) - STABLE
**Target Branch**: `staging`
**Last Verified State**: Numerical ID Migration and Database Normalization successfully deployed to Production (Neon + Vercel).

## Accomplishments (Task 20.1 & 20.2)
1.  **Database Migration**:
    *   Transitioned `personas.id` from `TEXT` to `SERIAL` (integer).
    *   Preserved original text slugs as `id_text` for RAG/Filesystem compatibility.
    *   **Normalization**: Split personas into two tables: `personas` (Thin Identity) and `persona_intelligence` (Fat Intelligence).
2.  **App Refactor (Zero UI Impact)**:
    *   Updated `PersonaProvider` to use `LEFT JOIN` for dossier continuity.
    *   Fixed Zod schema regressions in `/api/copywriter` and `/api/idea-refinement`.
    *   Updated Auth sessions to handle `number[]` for personas.
    *   Verified Admin CRUD features (Edit, Train, Sync) are fully functional with dual-ID support.
3.  **Security/Cleanup**:
    *   Removed local database backups from repository tracking and updated `.gitignore`.

## Immediate Next Steps
- [ ] **Task 20.3**: Further refine `PersonaProvider.ts` for specialized dual-ID UI scenarios.
- [ ] **Task 20.4**: UI Simplification: Remove `id_text` from all User/Admin lists to show only Numerical ID + Name.
- [ ] **Epic 21**: Transition "Sincronizar DB" to the "Intelligent Sync" mechanism using the new normalized structure.

## Technical Learnings
- **Zod Strictness**: API schema changes must allow both `string` and `number` during migration phases to prevent frontend crashes when IDs are transitioned.
- **Transactional Surgery**: Wrapping major PK changes and table splits in a single `BEGIN/COMMIT` block is mandatory for zero-downtime Neon migrations.
- **Metadata Mapping**: Always use `id_text` for filesystem and RAG metadata to avoid expensive re-indexing during ID migrations.
