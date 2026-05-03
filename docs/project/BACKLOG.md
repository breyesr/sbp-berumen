# Product Backlog & Epics

## Epic 0: Platform Pivot & Railway Bridge (Priority: Immediate)
**Owner**: DevOps & Backend
*Goal: Move high-latency AI logic away from Vercel to eliminate timeout constraints and prepare for the Intelligence Factory.*
- [ ] **Task 0.1**: Set up a Railway-hosted Node.js environment with shared access to the production Postgres/Redis.
- [ ] **Task 0.2**: Migrate `/api/stress-test` and `/api/persona` (and associated RAG logic) to the Railway container.
- [ ] **Task 0.3**: Configure Vercel as a "Thin Client" that proxies complex AI requests to the Railway backend via a secure private API.

## Epic 1: Infrastructure Resilience & Database Scaling (Critical) [DONE]
**Owner**: DevOps & Backend
- [x] **Task 1.1**: Update `src/lib/clients.ts` to increase the Postgres connection pool size. [DONE]
- [x] **Task 1.2**: Implement rate limiting for all API routes using Upstash/Redis. [DONE]
- [x] **Task 1.3**: Set up GitHub Actions CI pipeline. [DONE]
- [x] **Task 1.4**: Implement structured logging (Pino). [DONE]

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

## Epic 4: Data Layer Caching & Storage (Medium) [DONE]
**Owner**: Backend
- [x] **Task 4.1**: Migrate persona data to the database. [DONE]
- [x] **Task 4.2**: Implement caching for AI queries (using Redis). [DONE]

## Epic 5: The Admin Intelligence Dashboard (The Intelligence Factory) [DONE]
**Owner**: AI Engineer & Backend & UX/UI
*Goal: Provide a web-based UI for managing personas and uploading knowledge, eliminating the need for manual scripts.*
- [x] **Task 5.1**: Build the Admin Persona Management UI (`/admin/personas`) to list, search, and filter personas. [DONE]
- [x] **Task 5.2**: Implement the "Persona Editor" form to modify metadata (Name, Role, Cluster, Pains) directly in the DB. [DONE]
- [x] **Task 5.3**: Build the "Knowledge Dropzone" for browser-based file uploads (PDF/TXT) tied to specific personas. [DONE]
- [x] **Task 5.4**: Create the `/api/admin/ingest` pipeline to trigger chunking and embedding from the UI. [DONE]
- [ ] **Task 5.5**: Add an "Ingestion Status" tracker to show RAG processing progress.
- [ ] **Task 5.6**: Implement "Identity Synthesis": Automatically update persona metadata (synthesis, pains, goals) after a knowledge file is uploaded.
- [ ] **Task 5.7**: **Persona Photo Engine**: Add a photo field to the persona schema and implement a secure upload/storage pipeline to display persona avatars in the UI.


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

### Phase 1: TOTP UX Extreme Distinction
- [ ] **Task 17.1**: Refactor `src/app/(app)/profile/page.tsx` to include an "Extreme Visual Distinction" strategy.
- [ ] **Task 17.2**: Implement "Camera Mode" UI for App Download QR code (using Lucide `Camera` and explicit scan instructions).
- [ ] **Task 17.3**: Implement "Authenticator Mode" UI for Setup QR code (using Lucide `ShieldCheck` and a **STOP: DO NOT USE REGULAR CAMERA** warning).
- [ ] **Task 17.4**: Add the "Test Scan Check" gating button ("I have opened my app and am ready to scan") before revealing the Setup QR.
- [ ] **Task 17.5**: Update `src/lib/i18n/messages.ts` with emphatic security warnings and instructional copy in EN/ES.

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

