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
- [ ] **Task 20.5**: **Inline Management UI**: Replace static badges in `/admin/personas` with inline dropdowns for Cluster and Status for "bulk-style" editing speed.
- [ ] **Task 20.6**: **API Optimization & Unification**: Consolidate all persona fetching into `personaProvider.ts`. 
    *   **Unification**: Ensure `/api/admin` and `/api/public` use the same shared logic (`getPersonaData`) to prevent regressions.
    *   **Selective Fetching**: Implement query parameters to handle "light" vs "full" data shapes to optimize performance.
    *   **Security**: Maintain strict endpoint separation for RBAC while sharing the data contract.
- [ ] **Task 20.7**: **Identity Synthesis**: Automatically update persona metadata (synthesis, pains, goals) after a knowledge file is uploaded.
- [ ] **Task 20.8**: **Persona Photo Engine**: Add a photo field to the persona schema and implement a secure upload/storage pipeline to display persona avatars in the UI.
- [x] **Task 20.9**: **RAG Metadata Alignment**: Update `scripts/db/embed.ts` to include numerical `persona_id` in the document metadata alongside `id_text` (slugs) to ensure full relational integrity in the vector database. [DONE]
- [ ] **Task 20.10**: **Infrastructure Parity (Main)**: Replicate all Epic 20 database migrations and RAG infrastructure setup in the `main` branch environment.
- [x] **Task 20.11**: **Manual Production Training**: Establish a secure "Local-to-Production" embedding protocol to avoid Vercel timeouts and credential leakage. [DONE via SOP]

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


## Epic 22: Cluster Management Infrastructure (Medium Priority)
**Owner**: Backend & UX/UI
*Goal: Provide a dedicated interface for administrators to manage, rename, and delete persona clusters while maintaining data integrity.*

**Tasks:**
- [ ] **Task 22.1**: **API Expansion**: Implement `POST`, `PATCH`, and `DELETE` methods in `src/app/api/admin/clusters/route.ts`.
- [ ] **Task 22.2**: **Rename Logic**: Ensure that renaming a cluster ID (e.g., `students` -> `estudiantes`) triggers a bulk update in the `personas` table for all associated records.
- [ ] **Task 22.3**: **Delete Logic**: When a cluster is deleted, reset all associated personas to 'General' and remove the cluster record.
- [ ] **Task 22.4**: **Admin UI**: Create `/admin/clusters/page.tsx` with a high-density management table (Name, Description, Count of Personas).
- [ ] **Task 22.5**: **Navigation**: Add a "Manage Clusters" action button in the `Intelligence Factory` header.

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

## Epic 8: Persona Clustering & Layout (High) [DONE]
**Owner**: Backend & UX/UI
- [x] **Task 8.1**: Update schema to support "Cluster" labels as a first-class citizen in the DB. [DONE]
- [x] **Task 8.2**: Refactor `src/components/PersonaSelect.tsx` to display grouped personas (Clustered View). [DONE]
- [x] **Task 8.4**: Update API to return filtered and grouped persona data. [DONE]

## Epic 9: Deterministic Scoring Engine (DSE) (High) [DONE]
**Owner**: AI Engineer & Backend & UX/UI
- [x] **Task 9.1**: Define Micro-Agent Scorer prompts. [DONE]
- [x] **Task 9.2**: Implement parallel processing pipeline. [DONE]
- [x] **Task 9.3**: Develop weighted scoring utility in TypeScript. [DONE]
- [x] **Task 9.4**: Implement "Reasoning Window" in the UI. [DONE]
- [x] **Task 9.5**: Build "Consistency Anchor" using Redis caching. [DONE]

## Epic 10: Multi-Tenant Cluster Permissions (High) [DONE]
**Owner**: Backend & UX/UI
*Goal: Control user access to personas at the cluster level to support B2B and multi-team environments.*
- [x] **Task 10.1**: Create the `user_cluster_access` junction table in Postgres. [DONE]
- [x] **Task 10.2**: Update the Admin Users UI (`/admin/users`) to include an "Access Control" panel for cluster assignment. [DONE]
- [x] **Task 10.3**: Implement Authorization Middleware to validate persona access based on user-cluster entitlements. [DONE]
- [x] **Task 10.4**: Refactor `GET /api/personas` to return only authorized personas based on the session's clusters. [DONE]
- [x] **Task 10.5**: Implement Super-Admin "Global View" bypass for unrestricted access. [DONE]

## Epic 11: Optimized Copywriter Engine & UX (High Priority) [DONE]
**Owner**: Lead & Backend
- [x] **Task 11.1**: Migrate Copywriter logic to `streamObject` (AI SDK). [DONE]
- [x] **Task 11.2**: Refactor the Copywriter results view to support incremental streaming. [DONE]
- [x] **Task 11.3**: Transform Copywriter into the **Collapsible Intelligence Factory** architecture. [DONE]
    - [x] Replicate collapsible step state management.
    - [x] Integrate `PersonaCard` grid for selection.
    - [x] Group results by Platform and optimize card sizing.
    - [x] Standardize with "Factory Floor" aesthetic and Intelligence Assistant tooltips.

## Epic 12: Unified Strategic Access (Dossier Integration) [DONE]
**Owner**: UX/UI & Frontend
*Goal: Provide immediate access to persona intelligence across the entire platform.*
- [x] **Task 12.1**: Implement a "View Persona Dossier" button next to the persona selector in Stress Test and Copywriter pages. [DONE]
- [x] **Task 12.2**: Refactor the `PersonaDossier` into a shared UI component that adapts to user vs. admin context. [DONE]

## Epic 13: Advanced Cluster Navigation UX [DONE]
**Owner**: UX/UI
*Goal: Simplify navigation when multiple clusters are present.*
- [x] **Task 13.1**: Upgrade `PersonaSelect` to use a searchable combobox or grouped tab interface. [DONE]
- [x] **Task 13.2**: Add visual "Cluster Context" indicators in the main workspace. [DONE]

## Epic 14: Collapsible Intelligence Factory (High Priority) [DONE]
**Owner**: UX/UI & Frontend
*Goal: Transform the Stress Test into a structured, step-by-step collapsible workflow to reduce cognitive load.*
- [x] **Task 14.1**: Develop `CollapsibleStep` wrapper component with Framer Motion height animations and summary badges. [DONE]
- [x] **Task 14.2**: Implement `PersonaCard` ("Choose Your Fighter") grid with single-click selection and dossier integration. [DONE]
- [x] **Task 14.3**: Refactor `StressTestClient` state management to handle `currentStep` logic ('identity' | 'strategy' | 'results' | 'refinement'). [DONE]
- [x] **Task 14.4**: Integrate "Intelligence Assistant" tooltips (Expectation, Mechanism, Example) for all strategy input fields. [DONE]
- [x] **Task 14.5**: Implement auto-expansion and scroll-into-view logic for Section 3 (Results) triggered by streaming onset. [DONE]
- [x] **Task 14.6**: Wrap `RefinementPanel` in the collapsible architecture as the final step. [DONE]

## Epic 15: The Intelligence Matrix (Copywriter UX Refactor) [DONE]
**Owner**: UX/UI & Frontend
*Goal: Solve the "format selection nightmare" by shifting from a linear list to a high-density, context-aware tabbed matrix.*
- [x] **Task 15.1**: Implement "Auto-Select Primary" logic: Toggling a platform ON automatically selects its first format. [DONE]
- [x] **Task 15.2**: Build the `PlatformTabSystem`: A horizontal, icon-driven tab bar for selected networks in Section 2. [DONE]
- [x] **Task 15.3**: Develop the `FormatChipGrid`: A 2/3-column grid of compact pills with platform-specific branding (colors/icons). [DONE]
- [x] **Task 15.4**: Add "Bulk Matrix Controls": A "Select All" toggle per platform tab to reduce click-fatigue. [DONE]
- [x] **Task 15.5**: Implement "Coverage Badges" on Platform Cards to show selected/total formats at a glance. [DONE]
- [x] **Task 15.6**: Add a sticky "Factory Ledger" summary footer to Section 2 for immediate feedback on generation scale. [DONE]

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

