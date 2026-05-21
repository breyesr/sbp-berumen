# Handoff State: [2026-05-20] - Epic 25: Architectural Refactoring & Component Centralization

## Current Phase: Epic 25 (Standardization & Cleanup)
**Target Branch**: `feature/lead/epic-25-architectural-unification`
**Last Verified State**: 
- **Design System**: Fully modular 'Linear' design system established in `src/components/layout/StepWizardLayout.tsx`.
- **Centralization**: Common logic (Persona Dossier, Workflow navigation, Tooltips) moved to shared Hooks (`src/lib/hooks`).
- **Standardization**: Primary routes (`/` for Stress Test, `/copywriter`) now use the verified Linear architecture.
- **Cleanup**: Accordion components and legacy clients deleted; namespaces standardized (removed 'Linear' prefix from internal components).
- **Stability**: `npm run build` verified success.

## 🏆 Accomplishments
1.  **Shared Hooks Library**: Created `usePersonaDossier`, `useWorkflowState`, and `useTooltip` to eliminate logic duplication across features.
2.  **Modular UI Primitives**: 
    - Created `FieldTooltip.tsx` (centralized interactive help layer).
    - Created `PersonaSidebar.tsx` (unified intelligence context with 'dossier' and 'compact' grading variants).
3.  **Layout Standardization**: Implemented `StepWizardLayout` and `StepWizardContainer` to manage the 2-column grid, sticky logic, and transitions globally.
4.  **Legacy Deprecation**: Deleted `CollapsibleStep`, old clients, and accordion files. Standardized on the 100% verified Linear flows.
5.  **Namespace Cleanup**: Renamed all `Linear*` components to standard names (e.g., `StressTestClient`) to signal the end of the prototyping phase.

## 🚀 Immediate Next Steps
- [ ] **Task 21.9 (Backend)**: **Resolve RAG Orphanage**: Refactor the incremental embedder to prevent knowledge loss when personas are re-created with new IDs.
- [ ] **Task 23.4 (UX/UI)**: **Intelligence Bar**: Build a global context bar showing active persona and market metadata using the new `StepWizardLayout` hooks.
- [ ] **Merge to Staging**: Open PR for `feature/lead/epic-25-architectural-unification` into `staging`.

## ⚠️ Known Issues
- **RAG Orphanage**: Task 21.9 still pending (incremental embedder logic bug).
