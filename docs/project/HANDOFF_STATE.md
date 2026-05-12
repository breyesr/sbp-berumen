# Handoff State: [2026-05-11] - Persona Photo Engine & UI Integration

## Current Phase: Epic 20 (Identity) & Epic 23 (UI Refactor)
**Target Branch**: `feature/alpha/persona-photo-engine`
**Last Verified State**: 
- **Database**: `photo_url` column added to `personas`.
- **API**: Photo upload and serving endpoints fully functional and type-safe.
- **UI**: Avatar integration completed across Dossier, Cards, Selectors, and Admin Table.
- **Stability**: `npm run type-check` passing.

## 🏆 Accomplishments
1.  **Persona Photo Engine (Task 20.8)**: Completed full lifecycle implementation (Schema -> API -> UI) for persona avatars.
2.  **Hybrid Serving Strategy**: Implemented a public API serving layer that allows dynamic image loading in serverless environments by reading from the persistent `/data` volume.
3.  **UI Consistency**: Modernized the persona identity across the platform, replacing generic icons with custom photos or high-fidelity placeholders.
4.  **Admin Velocity**: Added the `PersonaPhotoUpload` component to the `IntelligenceDrawer`, allowing admins to manage identities without leaving the dashboard.
5.  **Refactor Completion**: Marked Task 20.8 as DONE in the backlog.

## 🚀 Immediate Next Steps
- [ ] **Merge Photo Engine**: Review and merge `feature/alpha/persona-photo-engine` into `staging`.
- [ ] **Task 23.1 (UX/UI)**: **Design System Update**: Sync `tailwind.config.ts` with the new color palette (Bison Gold, Warm Alabaster, etc.) and `rounded-2xl` defaults.
- [ ] **Task 23.2 (UX/UI)**: **Full-Screen Layout**: Refactor `AppLayout` to remove `max-w-7xl` and implement the base flex-row structure for the new sidebar.
- [ ] **Task 21.9 (Backend)**: **Resolve RAG Orphanage on Persona Re-Sync**: Fix the issue where re-created personas skip re-embedding.

## ⚠️ Known Issues
- **Image Size Limits**: Currently no client-side compression or server-side resizing. Large uploads could impact `/data` volume space.
- **RAG Orphanage (Unresolved)**: Task 21.9 still pending (RAG linking issue after persona re-sync).
