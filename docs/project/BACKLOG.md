# Product Backlog & Epics (Active)

## Epic 0: Platform Pivot & Railway Bridge (Priority: Immediate)
**Owner**: DevOps & Backend
*Goal: Move high-latency AI logic away from Vercel to eliminate timeout constraints and prepare for the Intelligence Factory.*
- [ ] **Task 0.1**: Set up a Railway-hosted Node.js environment with shared access to the production Postgres/Redis.
- [ ] **Task 0.2**: Migrate `/api/stress-test` and `/api/persona` (and associated RAG logic) to the Railway container.
- [ ] **Task 0.3**: Configure Vercel as a "Thin Client" that proxies complex AI requests to the Railway backend via a secure private API.
- [ ] **Task 0.4**: **Restore Persistent Storage**: Transition the "Vercel-Safe" ingestion (Database-only) back to a "Hybrid-Persistent" storage model using Railway's Persistent Volumes for the `/data` folder.

> **Note on Vercel-Safe Bridge**: Currently, ingestion skips the filesystem on remote (Vercel) to prevent 500 errors. Once Railway is active, this must be reverted to ensure files are saved to the persistent volume for RAG and backup integrity.


## Epic 2: Frontend De-Monolithization & UX Refinement (High)
**Owner**: Frontend & UX/UI
- [x] **Task 2.1**: Refactor `src/app/(app)/page.tsx` into smaller components. [DONE]
- [x] **Task 2.2**: Migrate static data fetching to Server Components. [DONE]
- [x] **Task 2.3**: Implement `Suspense` and streaming states. [DONE]
- [ ] **Task 2.4**: Introduce robust Error Boundaries for isolated component failures.
- [ ] **Task 2.5**: **Build Performance Optimization**: Refactor heavy Admin components (Drawers, Dossiers) to use `next/dynamic` to reduce the initial bundle size and accelerate Vercel build times.

## Epic 3: AI Pipeline Optimization & LLMOps Guardrails (High)
**Owner**: AI Engineer & LLMOps
- [ ] **Task 3.1**: Implement a token counting utility (`tiktoken`).
- [ ] **Task 3.2**: Add exponential backoff and retry logic for OpenAI.
- [ ] **Task 3.3**: Refactor hybrid search into a unified SQL query.
- [ ] **Task 3.4**: Optimize ingestion script for concurrency.


## Epic 20: Persona Refactor & ID Migration (High Priority)
**Owner**: Backend & UX/UI
*Goal: Transition to a robust numerical ID system while simplifying the UI and accelerating the management workflow. This Epic must adhere to the UX Integrity Protocol to ensure zero loss of existing functionality.*

**UX Integrity Protocol Mandates:**
1. **Drawer Continuity**: Keep existing "Edit" and "Train" drawers functional and identical.
2. **Visual Consistency**: Use existing design tokens and "Factory Floor" aesthetics for new inline controls.
3. **Non-Destructive Migration**: Preserving `id_text` (slugs) for RAG and filesystem stability.

**Tasks:**
- [x] **Task 20.1**: **Database Migration & Normalization** [DONE]
- [x] **Task 20.2**: **App Refactor (Zero UI Impact)** [DONE]
- [x] **Task 20.3**: **Provider Refactor**: Update `PersonaProvider.ts` to support dual-ID lookups (Numerical for DB, Text for Filesystem/RAG). [DONE]
    *   **Refinement**: Ensure FS fallback uses `id_text` instead of `-1`.
    *   **Validation**: Prevent invalid FS lookups for purely numerical IDs when DB fetch fails.
    *   **Typing**: Update `Persona` type to support `number | string` for the `id` field.
- [x] **Task 20.4**: **UI Simplification**: Transition to a "Human-First" display by hiding text slugs (`id_text`) and numerical IDs across all user/admin lists, prioritizing Name, Role, and Cluster for identity. [DONE]
- [x] **Task 20.5**: **Inline Management UI**: Replace static badges in `/admin/personas` with inline dropdowns for Cluster and Status for "bulk-style" editing speed. [DONE]
- [x] **Task 20.13**: **Inline Name & Role Editing**: Implement click-to-edit or hover-focus editing for Name and Core Role directly in the admin table. [DONE]
- [x] **Task 20.14**: **Cluster Management Dashboard**: Build a dedicated CRUD interface for creating, renaming, and deleting persona clusters (Epic 22 sub-task). [DONE]
- [ ] **Task 20.6**: **API Optimization & Unification**: Consolidate all persona fetching into `personaProvider.ts`. 
    *   **Unification**: Ensure `/api/admin` and `/api/public` use the same shared logic (`getPersonaData`) to prevent regressions.
    *   **Selective Fetching**: Implement query parameters to handle "light" vs "full" data shapes to optimize performance.
    *   **Security**: Maintain strict endpoint separation for RBAC while sharing the data contract.
- [ ] **Task 20.7**: **Identity Synthesis**: Automatically update persona metadata (synthesis, pains, goals) after a knowledge file is uploaded.
- [x] **Task 20.8**: **Persona Photo Engine**: Add a photo field to the persona schema and implement a secure upload/storage pipeline to display persona avatars in the UI. [DONE]
    *   **Vercel Compatibility Note**: Currently uses `public/avatars/` for static serving.
    *   **Infrastructure Debt**: When migrating to Railway (Epic 0), revert the storage path to the persistent volume (e.g., `/data/personas/`) and restore the `/api/public/personas/[id]/photo` serving logic to allow runtime uploads without Git commits.

- [x] **Task 20.9**: **RAG Metadata Alignment**: Update `scripts/db/embed.ts` to include numerical `persona_id` in the document metadata alongside `id_text` (slugs) to ensure full relational integrity in the vector database. [DONE]
- [x] **Task 20.10**: **Infrastructure Parity (Main)**: Replicate all Epic 20 database migrations and RAG infrastructure setup in the `main` branch environment. [DONE]
- [x] **Task 20.11**: **Manual Production Training**: Establish a secure "Local-to-Production" embedding protocol to avoid Vercel timeouts and credential leakage. [DONE via SOP]
- [x] **Task 20.12 (High)**: **RAG Readiness Check**: Implement logic to detect if a persona has no associated RAG data. Flag these as "Not Ready" in the UI and disable them for Stress Test/Copywriter use to prevent low-quality outputs. [DONE]
- [x] **Task 20.15**: **Dossier RBAC Hardening**: Silently hide sensitive psychographic sections (Barreras de Decisión, Voz del Cliente) for non-admin users to prevent information leakage of high-level strategic data. [DONE]

...

### 3. Execution Steps
#### Phase 1: Identity Protection [STABLE]
- [x] **Task 21.1**: **Migration**: Create a SQL script to add the `last_synced_at` column. [DONE]
- [x] **Task 21.2**: **Implementation**: Update `src/lib/db-sync.ts` to implement the comparison logic and the surgical `UPDATE`. [DONE]
- [x] **Task 21.3**: **Validation**: Edit a persona's name in UI -> Run Sync -> Confirm persistence. [DONE]

#### Phase 2: Strategic Protection & UTC Alignment [STABLE]
- [x] **Task 21.4**: **UTC Migration**: Convert persona timestamps to `TIMESTAMPTZ` to eliminate timezone discrepancies. [DONE]
- [x] **Task 21.5**: **Intelligence Protection**: Refactor sync logic to protect the `persona_intelligence` table (Pains, Goals, Metadata) from overwrites. [DONE]
- [x] **Task 21.6**: **Standardized Comparison**: Ensure date comparisons use UTC `.getTime()` for cross-environment reliability. [DONE]
- [x] **Task 21.7**: **Sync Duplication Resolution**: Implement name/cluster matching to prevent duplicate persona creation during filesystem sync. [DONE]
- [x] **Task 21.8**: **RAG Brain Cleanup**: Refactor embedder to remove technical Copywriter noise and purged stale chunks from DB. [DONE]
- [ ] **Task 21.9**: **Resolve RAG Orphanage on Persona Re-Sync**: Fix the issue where re-created personas (deleted and then re-synced from Git) appear "Untrained" because incremental logic skips files with identical hashes, failing to link them to the new Numerical ID.


## Epic 22: Cluster Management Infrastructure (Medium Priority)
**Owner**: Backend & UX/UI
*Goal: Provide a dedicated interface for administrators to manage, rename, and delete persona clusters while maintaining data integrity.*

**Tasks:**
- [ ] **Task 22.1**: **API Expansion**: Implement `POST`, `PATCH`, and `DELETE` methods in `src/app/api/admin/clusters/route.ts`.
- [ ] **Task 22.2**: **Rename Logic**: Ensure that renaming a cluster ID (e.g., `students` -> `estudiantes`) triggers a bulk update in the `personas` table for all associated records.
- [ ] **Task 22.3**: **Delete Logic**: When a cluster is deleted, reset all associated personas to 'General' and remove the cluster record.
- [ ] **Task 22.4**: **Admin UI**: Create `/admin/clusters/page.tsx` with a high-density management table (Name, Description, Count of Personas).
- [ ] **Task 22.5**: **Navigation**: Add a "Manage Clusters" action button in the `Intelligence Factory` header.

## Epic 23: UI/UX Refactor - "The Intelligence Factory 3.0" (High Priority)
**Owner**: UX/UI & Frontend
*Goal: Implement a full-screen, brand-aligned experience maximizing screen real estate and strategic focus.*

**Tasks:**
- [ ] **Task 23.1**: **Design System Update**: Sync Tailwind config with Brand Kit 3.0 (Colors, Typography, `rounded-2xl`).
- [x] **Task 23.2**: **Full-Screen Layout**: Refactor `AppLayout` and `AppHeader` to remove `max-w-7xl` and support fluid width. [DONE]
- [x] **Task 23.3**: **Collapsible Command Sidebar**: Implement a slim, collapsible sidebar with icon-only and expanded modes. [DONE]
- [ ] **Task 23.4**: **Intelligence Bar**: Build a global context bar showing active persona and market metadata.
- [x] **Task 23.5**: **Linear Paginated Flow**: Refactor Stress Test UI to a horizontal 5-step paginated wizard (1-5), replacing the collapsible and matrix flows for better cognitive pacing. [DONE]
- [x] **Task 23.6**: **Side-by-Side Copywriter**: Redesign Copywriter UI for a dual-pane editor/preview workspace. [DONE]
- [ ] **Task 23.7**: **Theme Engine**: Implement high-fidelity "Warm Alabaster" and "IntelAgent Black" theme switching.


## Epic 6: Relational Intelligence (GraphRAG Evolution)
**Owner**: AI Engineer & Backend
- [ ] **Task 6.1**: Implement Graph Traversal logic.
- [ ] **Task 6.2**: Design and implement the Graph Schema in Postgres.
- [ ] **Task 6.3**: Refactor `src/lib/rag.ts` to include Graph Traversal.
- [ ] **Task 6.4**: Implement Citation Mapping.

## Epic 7: Iterative Strategy Co-Pilot & Integrity Scoring
**Owner**: Backend & AI Engineer & UX_UI
- [ ] **Task 7.1**: Implement a Stateful Session Database (`conversations` and `messages`).
- [ ] **Task 7.2**: Develop the "Critical Friend" logic (Integrity Guardrails).
- [ ] **Task 7.3**: Build the "Progress to Market Fit" UI chart.
- [ ] **Task 7.4**: Implement "Strategic Pivot" logic.


## Epic 16: The Intelligence Wizard (High Priority)
**Owner**: AI Engineer & UX/UI & Frontend
*Goal: Reduce user friction by co-authoring the strategic prompt and iteratively refining the pitch based on persona feedback.*

### Stage 01: Strategic Distillation (Phase 2)
- [ ] **Task 16.1**: Develop `/api/wizard/questions` to analyze lazy prompts and return 3 strategic questions (with 3 suggested answers each).
- [ ] **Task 16.2**: Build the `WizardDrawer` UI component inside the Phase 2 block with an "Unapplied Changes" counter.
- [ ] **Task 16.3**: Implement streaming distillation logic (`/api/wizard/distill`) to auto-populate Idea, Goal, and Focus fields.
- [ ] **Task 16.4**: Create the "Snapshot & Revert" state management mechanism for user safety.

### Stage 02: Intelligence Refinement (Phase 4)
- [ ] **Task 16.5**: Refactor `RefinementPanel` to support guided, persona-specific Q&A based on Phase 3 gaps.
- [ ] **Task 16.6**: Develop the Side-by-Side comparison UI with a "Download Refined Strategy" capability.
- [ ] **Task 16.7**: Implement the "Iteration Loop" to re-trigger evaluation from Phase 4 directly into Phase 3.
- [ ] **Task 16.8**: Add "Refinement History" local state to track the evolution of the idea across loops.


## Epic 17: Security & UX (2FA Evolution) (High Priority)
**Owner**: UX/UI & AppSec & Backend
*Goal: Harden account security while eliminating user confusion during the 2FA enrollment process.*

### Phase 1: TOTP UX Extreme Distinction [DONE]
- [x] **Task 17.1**: Refactor `src/app/(app)/profile/page.tsx` to include an "Extreme Visual Distinction" strategy. [DONE]
- [x] **Task 17.2**: Implement "Camera Mode" UI for App Download QR code (using Lucide `Camera` and explicit scan instructions). [DONE]
- [x] **Task 17.3**: Implement "Authenticator Mode" UI for Setup QR code (using Lucide `ShieldCheck` and supportive guidance). [DONE]
- [x] **Task 17.4**: Add the "Test Scan Check" gating button ("I have opened my app and am ready to scan") before revealing the Setup QR. [DONE]
- [x] **Task 17.5**: Update `src/lib/i18n/messages.ts` with emphatic security warnings and instructional copy in EN/ES. [DONE]

### Phase 2: SMS 2FA with Twilio
- [ ] **Task 17.6**: Integrate Twilio SDK and set up environment-specific API configuration.
- [ ] **Task 17.7**: Update database schema (`users` table) with `phone_number`, `sms_enabled`, and `sms_verification_code`.
- [ ] **Task 17.8**: Develop the `/api/auth/sms/send` and `/api/auth/sms/verify` endpoints.
- [ ] **Task 17.9**: Implement the SMS enrollment UI flow in the user profile.
- [ ] **Task 17.10**: Update the sign-in flow to support SMS as a fallback or primary 2FA method.


## Epic 18: Account & Profile Management (Medium Priority)
**Owner**: Backend & UX/UI
*Goal: Expand the user profile to capture essential business and personal identity details.*

- [ ] **Task 18.1**: Update database schema (`users` table) to include `first_name`, `last_name`, `phone`, and `company` (enterprise) columns.
- [ ] **Task 18.2**: Develop a unified "Account Settings" UI in `/profile` to manage personal details and enterprise affiliation.
- [ ] **Task 18.3**: Implement API endpoints for fetching and updating extended user profile data.
- [ ] **Task 18.4**: Update the registration flow (`/api/register`) to optionally capture these details during account creation.
- [ ] **Task 18.5**: Integrate profile completeness indicators or "Onboarding Checklist" to encourage users to fill in their details.


## Epic 19: Memory & Persistence (User History) (High Priority)
**Owner**: Backend & UX/UI & Frontend
*Goal: Allow users to persist, revisit, and iterate on their previous Stress Test and Copywriter sessions.*

- [ ] **Task 19.1**: **Schema Evolution**: Create the `user_history` table in Postgres with columns for `userId`, `type` (stress-test/copywriter), `name` (auto-generated title), and `data` (JSONB state).
- [ ] **Task 19.2**: **History CRUD API**: Develop the `/api/history` endpoints for listing, fetching, saving, and deleting session snapshots.
- [ ] **Task 19.3**: **Stress Test Integration**: Refactor `StressTestClient` to support state hydration from history and implement auto-save triggers after generation/refinement.
- [ ] **Task 19.4**: **Copywriter Integration**: Refactor `CopywriterClient` to support state hydration and persistence logic.
- [ ] **Task 19.5**: **The History Ledger**: Build a unified "Recent Activity" or "History" UI component (Sidebar or Dashboard) to allow users to quickly switch between active and past sessions.
- [ ] **Task 19.6**: **Contextual Resume**: Implement logic to detect when a user is returning to a session and restore the "Intelligence Factory" step progress automatically.


## Epic 27: Account Integrity & Session Management (High Priority)
**Owner**: Backend & AppSec
*Goal: Prevent unauthorized account sharing and ensure session integrity across the platform.*

- [ ] **Task 27.1**: **Concurrent Session Detection & Enforcement**: Implement a mechanism to detect and prevent simultaneous account usage across multiple browsers or devices, ensuring that a new login invalidates or blocks existing sessions. (Strategy to be defined: JWT versioning vs. DB-backed sessions).




## Epic 29: Production Stability & System Reliability (CRITICAL)
**Owner**: Frontend & Backend & DevOps
*Goal: Resolve blocking production errors, including client-side exceptions and database query failures, while hardening the fallback systems.*

**Tasks:**
- [x] **Task 29.1**: **Database Query & Fallback Fix**: Resolve the `AggregateError` in `listPersonas` by fixing the SQL ID cast and ensuring the filesystem fallback is robust and tested. [DONE]
- [x] **Task 29.2**: **Production Build Integrity (clsx)**: Investigate and fix the `ReferenceError: clsx is not defined` error occurring in the Vercel production environment, likely due to optimization or transpilation issues. [DONE]
- [x] **Task 29.3**: **External Script Conflict (share-modal.js)**: Identify the source of `share-modal.js` (likely a third-party tracking or sharing script) and fix the `null (reading 'addEventListener')` error causing client-side crashes. [DONE]
- [ ] **Task 29.4**: **Error Boundary Hardening**: Implement global and component-level error boundaries to prevent single-component failures from crashing the entire application during render.


## Epic 30: Client-Side PDF Export Engine (Medium–High Priority)
**Owner**: Frontend & UX/UI
**Branch**: `feature/frontend/pdf-export-engine` (from `origin/staging`)
*Goal: Replace all three `.txt` export touchpoints across the platform with a branded, enterprise-grade `.pdf` download — rendered entirely in the browser with zero backend involvement.*

### Architectural Constraints (Non-Negotiable)
- **Strictly client-side**: All PDF assembly must happen in the browser runtime.
- **Zero backend compute**: No new API routes, server actions, or serverless functions for PDF generation.
- **Lazy-loaded library**: PDF library must be dynamically imported only when the export button is triggered.

### Library Decision
> **Recommended**: `@react-pdf/renderer` (~450kb, lazy-loaded). Produces true portable PDFs with a React-familiar API.
> ⚠️ **Critical**: This library does NOT snapshot existing React/HTML/CSS components. Each PDF template must be built as a dedicated parallel component using `@react-pdf/renderer` primitives (`Document`, `Page`, `View`, `Text`).

### Tasks

- [x] **Task 30.1**: **Library Setup & Shared Infrastructure** — Add `@react-pdf/renderer` to `package.json`. Scaffold a shared `lib/pdf/` utility module with base brand styles (colors, typography, margins). Configure lazy `import()` so the library loads only on export trigger. Confirm `npm run build` passes.

- [x] **Task 30.2**: **Copywriter PDF Export** — Replace `handleExport()` in [`CopywriterClient.tsx`](src/components/copywriter/CopywriterClient.tsx) (lines 167–200). Output: `IntelAgent-Copywriter-[PersonaName]-[YYYY-MM-DD].pdf`.
  - Cover page: logo/wordmark, Persona Name, Goal, Context, Date.
  - Body pages: outputs grouped by Platform → Format, with page-break isolation per platform group.
  - Labels must respect active locale (`useI18n`).

- [x] **Task 30.3**: **Stress Test Analysis PDF Export** — Replace `handleExport()` in [`StressTestClient.tsx`](src/components/stress-test/StressTestClient.tsx) (lines 219–241). Output: `IntelAgent-StressTest-[PersonaName]-[YYYY-MM-DD].pdf`.
  - Header: Persona Name, Idea Original, Challenge Level, Date.
  - Body: Veredicto, Confidence Score, Reacción, Fortalezas (bulleted), Brechas y Riesgos (bulleted), Plan de Acción (bulleted).

- [x] **Task 30.4**: **Refined Pitch PDF Export** — Replace `handleExportRefined()` in [`StressTestClient.tsx`](src/components/stress-test/StressTestClient.tsx) (lines 243+). Output: `IntelAgent-RefinedPitch-[PersonaName]-[YYYY-MM-DD].pdf`.
  - Single-page layout: logo/wordmark, Persona Name, Goal, Date, full Refined Pitch text.

- [x] **Task 30.5**: **Branding & Visual Alignment** — Ensure all three PDF templates share consistent typographic hierarchy, brand color palette, IntelAgent wordmark, and structured section dividers.

- [x] **Task 30.6**: **Cross-Browser Validation** — Verify `.pdf` download works correctly on Chrome, Safari, Firefox, and Edge (latest). Confirm files open in native OS PDF viewers.

### Definition of Done
- [x] All 3 `.txt` exports replaced by `.pdf` equivalents (Tasks 30.2, 30.3, 30.4).
- [x] Zero new backend endpoints introduced.
- [x] `npm run build` succeeds on the feature branch.
- [ ] Cross-browser validation passed and documented.
- [ ] Vercel Preview URL attached to PR into `staging`.
- [ ] `HANDOFF_STATE.md` and `HANDOFF_LOG.md` updated before merge.


