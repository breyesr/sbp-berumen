# Handoff State: [2026-05-11] - Persona Photo Engine & UI Integration

## Current Phase: Epic 20 (Identity) & Epic 23 (UI Refactor)
**Target Branch**: `feature/alpha/persona-photo-engine`
**Last Verified State**: 
- **Database**: `photo_url` column added to `personas` (Local & Remote).
- **Storage**: Refactored to use `public/avatars/` for Vercel-compatible static serving.
- **API**: Photo upload logic updated to target the public directory. Obsolete serving API removed.
- **UI**: Avatar integration completed and verified. Correctly falls back to the original icon placeholder when no photo is present.
- **Stability**: `npm run type-check` passing (ignoring `.next` cache).

## 🏆 Accomplishments
1.  **Persona Photo Engine (Task 20.8)**: Completed full lifecycle implementation (Schema -> API -> UI) for persona avatars.
2.  **Vercel-Safe Static Serving**: Refactored the system to store photos in the `public/` folder, ensuring they are bundled as static assets and served reliably by Vercel.
3.  **End-to-End Persistence Fix**: Resolved bugs in Admin CRUD APIs that were stripping `photo_url` during state updates.
4.  **Placeholder Integrity**: Fixed an issue where non-existent images were being forced, ensuring personas without photos correctly display the default SVG icon.
5.  **Refactor Completion**: Marked Task 20.8 as DONE in the backlog.
6.  **Dossier RBAC Hardening (Task 20.15)**: Implemented silent hiding of sensitive sections (Objections & Quotes) for non-admin users to protect strategic information.

## 🚀 Immediate Next Steps
- [ ] **Remote Data Sync**: Run the `UPDATE` command on the production DB to link existing personas to their new `/avatars/[slug].png` paths.
- [ ] **Task 23.1 (UX/UI)**: **Design System Update**: Sync `tailwind.config.ts` with the new color palette (Bison Gold, Warm Alabaster, etc.) and `rounded-2xl` defaults.
- [ ] **Task 23.2 (UX/UI)**: **Full-Screen Layout**: Refactor `AppLayout` to remove `max-w-7xl` and implement the base flex-row structure for the new sidebar.
- [ ] **Task 21.9 (Backend)**: **Resolve RAG Orphanage on Persona Re-Sync**: Fix the issue where re-created personas skip re-embedding.

## ⚠️ Known Issues
- **Git Requirement**: New photos uploaded locally must be committed and pushed to GitHub to appear on the Vercel server.
- **Railway Reversion**: This "Static-First" approach should be reverted to a Persistent Volume model once the move to Railway is complete.
- **Image Size Limits**: Currently no client-side compression or server-side resizing.
- **RAG Orphanage (Unresolved)**: Task 21.9 still pending (RAG linking issue after persona re-sync).
