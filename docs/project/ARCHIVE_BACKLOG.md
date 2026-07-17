# Archived Backlog (Completed Epics)

## Epic 1: Infrastructure Resilience & Database Scaling (Critical) [DONE]
**Owner**: DevOps & Backend
- [x] **Task 1.1**: Update `src/lib/clients.ts` to increase the Postgres connection pool size. [DONE]
- [x] **Task 1.2**: Implement rate limiting for all API routes using Upstash/Redis. [DONE]
- [x] **Task 1.3**: Set up GitHub Actions CI pipeline. [DONE]
- [x] **Task 1.4**: Implement structured logging (Pino). [DONE]

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
- [x] **Task 5.5**: Add an "Ingestion Status" tracker to show RAG processing progress. [DONE]

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

## Epic 24: Copywriter 2.0 - Platform-Native Intelligence (High Priority) [DONE]
**Owner**: AI Engineer & Backend & UX/UI
*Goal: Evolve the Copywriter from a generic text generator to a specialized platform-native engine using the new Directive-based architecture.*

**Tasks:**
- [x] **Task 24.1**: **Dynamic Output Schema**: Refactor `src/app/api/copywriter/route.ts` to replace hardcoded `primaryCopy` with a flexible `fields: Record<string, string>` map. [DONE]
- [x] **Task 24.2**: **Directives Migration**: Convert all 33 format JSONs to the new "System Directives & Hard Constraints" structure established in `temp-longform-video.json`. [DONE]
- [x] **Task 24.3**: **Adaptive UI Components**: Redesign the Copywriter results view to render platform-specific fields (e.g., a 'Title' box, a 'Script' box) based on the format's `required_generation_elements`. [DONE]
- [x] **Task 24.4**: **Strategic Persona Infusion**: Explicitly inject persona "Anchors," "Pains," and "Triggers" into the Copywriter prompt to ensure the output is strategically grounded. [DONE]
- [x] **Task 24.5**: **Resonance Framework Refactor**: Refactor the system prompt to use the "Writer -> Audience Resonance" hierarchy, prioritizing strategic translation over literal quoting. [DONE]

## Epic 25: Architectural Refactoring & Component Centralization (High Priority) [DONE]
**Owner**: Frontend & Lead
*Goal: Streamline the codebase by abstracting duplicated UI logic, hooks, and types into a centralized design system, ensuring a robust foundation for the "Linear" evolution.*

**Architectural Mandates & Safety Notes (READ BEFORE STARTING):**
- 🛑 **No Logic "Magic"**: When centralizing `usePersonaDossier` or `useWorkflow`, do NOT add new features. The first pass must be a 1:1 behavioral replica to ensure zero regressions. [DONE]
- 🛑 **Avoid "Prop-Drilling" Hell**: If merging `LinearIdeaSection` and `IdeaSection` results in a component with 20+ props, STOP. Use the "Compound Component" pattern or a shared context instead. [DONE]
- 🛑 **Protect the "Premium" Feel**: Both features use unique Framer Motion timings. Ensure the centralized `StepWizardLayout` preserves the specific "weighted" feel of the transitions. [DONE]
- 🛑 **Intelligence Drift Prevention**: This is the primary goal. Any change to a shared schema (e.g., `PersonaOption`) must be validated against both Stress Test and Copywriter build targets. [DONE]

**Tasks:**
- [x] **Task 25.1**: **UI Primitive Centralization**: Move shared components like `FieldTooltip` to `src/components/ui/` and standardize their implementation. [DONE]
- [x] **Task 25.2**: **Logic Abstraction (Hooks)**: Create `usePersonaDossier` and `useWorkflowState` hooks to centralize persona data fetching and wizard navigation logic. [DONE]
- [x] **Task 25.3**: **Layout Standardization**: Develop a `StepWizardLayout` wrapper to unify the 2-column grid and sticky sidebar patterns used in linear flows. [DONE]
- [x] **Task 25.4**: **Type & Schema Unification**: Centralize `PersonaOption`, `FIELD_LIMITS`, and shared Zod schemas into a unified directory (e.g., `src/lib/types.ts` or `src/lib/schemas/`). [DONE]
- [x] **Task 25.5**: **"Mode-based" Component Refactor**: Merge `IdeaSection`/`LinearIdeaSection` and `AnalysisResults`/`LinearAnalysisResults` into single components with a `variant` prop (e.g., `collapsible` | `linear`). [DONE]
- [x] **Task 25.6**: **Utility Centralization**: Move report formatting and export logic to a shared utility helper (e.g., `src/lib/utils/export.ts`). [DONE]
- [x] **Task 25.7**: **Legacy Deprecation**: Remove accordion components and unify routes. [DONE]

## Epic 26: Login Experience & Feedback Optimization (High Priority) [DONE]
**Owner**: Frontend & UX/UI
*Goal: Eliminate the "Feedback Vacuum" during the login process by implementing explicit loading states and preventing redundant submissions.*

**Tasks:**
- [x] **Task 26.1**: **Execution State Tracking**: Implement `isLoading` state in `LoginPageContent` to track the lifecycle of the `signIn` and `getSession` requests. [DONE]
- [x] **Task 26.2**: **Button State Machine**: Redesign the login button to include a "Processing" state (disabled, opacity change, and a localized "Signing in..." label with a CSS spinner). [DONE]
- [x] **Task 26.3**: **Input Lock-down**: Disable email and password inputs while `isLoading` is true to prevent accidental edits and provide clear visual hierarchy of the "Processing" state. [DONE]
- [x] **Task 26.4**: **Redirect Optimization**: Ensure the UI provides a final "Success" feedback or transition indicator immediately after `signIn` succeeds, even before `router.push` completes. [DONE]
- [x] **Task 26.5**: **Auth Error Refinement**: Implement custom `InvalidCredentialsError` and refine login page feedback to avoid console errors on standard failed attempts. [DONE]

## Epic 28: Multi-Theme Architecture & Layout Lock (Completed: May 21, 2026)
**Owner**: Frontend & UX/UI
*Goal: Implement a toggleable theme system (Brand vs. Experimental) with zero layout shift, ensuring visual flexibility without structural instability.*

**Mandates:**
1. **Layout Lock**: Structural variables (spacing, sizing) must remain immutable across themes.
2. **Contract-First**: Use CSS variables for all visual properties to allow seamless swapping.

**Tasks:**
- [x] **Task 28.1**: **Theme Infrastructure**: Install `next-themes` and implement the `ThemeProvider` in the root layout.
- [x] **Task 28.2**: **CSS Tokenization**: Refactor `globals.css` to separate structural tokens from visual tokens (Brand vs. Experimental).
- [x] **Task 28.3**: **Brand Kit Implementation**: Map the formalized `BRAND_KIT.json` colors to the `[data-theme='brand']` scope.
- [x] **Task 28.4**: **Experimental Skin Design**: Define the "Tech/Dark" skin tokens for the `[data-theme='experimental']` scope.
- [x] **Task 28.5**: **Theme Toggle UI**: Build and integrate a premium toggle component into the `AppHeader`.
- [x] **Task 28.6**: **Validation Audit**: Perform a DOM-diff audit during theme toggling to confirm zero layout shift.

> **Note on Experimental Theme**: The `experimental` (Indigo/Tech) theme remains in the CSS for reference but has been removed from the UI toggle to focus on the Institutional Brand Kit. It may be fully removed in future cycles.

