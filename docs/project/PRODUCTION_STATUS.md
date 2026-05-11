# Live Production Status

## Environment Summary
- **Current Stack**: Next.js 16, Postgres with pgvector, Vercel Node.js Functions, OpenAI API, Upstash Redis.
- **Status**: **STABLE & FEATURE-COMPLETE (Refined Intelligence Factory, Multi-Tenant Admin)**

## Latest Deployments
- **Epic 21: Incremental RAG & Intelligence Optimization (May 10, 2026)**:
    - **Hash-Based Sync**: Implemented SHA-256 content hashing in `embed.ts` to skip unchanged files, reducing OpenAI API costs to zero for static content.
    - **System Hardening**: Integrated filters to ignore hidden/binary files (e.g., `.DS_Store`) during ingestion, resolving database encoding failures.
    - **Deterministic Cleanup**: Verified automated purging of stale document vectors when source files are deleted or modified.
- **Epic 20 & 21: Stabilization Path - Phase 1 (May 9, 2026)**:
    - **Intelligent Sync**: Implemented "Human-First" precedence to protect manual UI edits from being overwritten by repository files.
    - **UTC Standardization**: Migrated all persona timestamps to `TIMESTAMPTZ` to ensure cross-environment synchronization reliability.
    - **Numerical ID Transition**: Finalized migration from text-slugs to SERIAL IDs for robust relational integrity.
    - **Vercel-Safe Ingestion**: Hardened the deployment bridge to bypass filesystem locks in serverless environments.
- **Epic 17: 2FA UX Extreme Distinction (May 4, 2026)**:
    - **Expert Path (Fast Track)**: Added an immediate skip option for power users with existing apps.
    - **Extreme Visual Distinction**: Implemented Blue (Camera) and Amber (Authenticator) themes to resolve QR scan confusion.
    - **Stabilized Transitions**: Integrated `min-height` containers and `scrollIntoView` logic to eliminate UI "jumps" during enrollment.
    - **Authenticator Focus**: Defaulted exclusively to Google Authenticator to simplify onboarding choice.
- **Epic 15: The Intelligence Matrix (April 30, 2026)**:
    - **Linear Production Pipeline**: Refactored Copywriter into a logical 3-phase vertical flow (Briefing -> Propagation -> Matrix).
    - **Contextual Tab System**: Isolated configuration per network via a horizontal platform switcher.
    - **High-Density Matrix**: Optimized format selection with branded chips in an expandable grid (up to 5 columns).
    - **Smart Production Tools**: Integrated "Auto-Select Primary" formats, "Select All" bulk toggles, and a sticky "Production Ledger" summary footer.
- **Epic 11: Copywriter Intelligence Factory (April 30, 2026)**:
    - **Step-by-Step Refactor**: Migrated Copywriter to the 3-step collapsible workflow (Persona -> Strategy -> Grouped Output).
    - **Platform Grouping**: Dramatically reduced vertical scroll by grouping outputs in platform-specific containers with side-by-side card layouts.
    - **Intelligence Assistant**: Integrated tooltips and guidance for Brief creation (Context, Message, Goal).
    - **Server-Side Hydration**: Optimized initial data load by pre-fetching platforms and personas on the server.
- **Epic 5 Refinement: Persona Status Management (April 30, 2026)**:
    - **Soft-Disable**: Added `is_active` toggle to personas for granular visibility control.
    - **Admin Dashboard**: Enhanced `/admin/personas` with eye/eye-off toggles and status filtering.
    - **Self-Healing Sync**: Database synchronization tool now automatically injects status columns and initializes values.
- **Epic 14: Collapsible Intelligence Factory (April 29, 2026)**:
    - **Strategic Thread Architecture**: Migrated to a unified vertical accordion with a left-aligned connecting thread for a seamless process flow.
    - **Compact Identity Tiles**: High-density "Choose Your Fighter" grid with cluster-based grouping and visual separators.
    - **Optimized Refinement Flow**: Decoupled refinement triggers into Phase 3; reserved Phase 4 for integrated Q&A and comparison.
    - **Precision Navigation**: Refined scroll-to-top logic with layout stabilization for perfect block framing.
    - **Full i18n**: 100% localization for all factory steps in English and Spanish.
- **Epic 10: Multi-Tenant Cluster Permissions (April 29, 2026)**:
    - **Entitlement Isolation**: Extended Auth/JWT to enforce cluster-based persona visibility.
    - **Admin Access Control**: Built a granular management panel for assigning users to persona clusters.
    - **API Resilience**: Implemented robust fallbacks to prevent dashboard crashes during DB migrations.
- **Epic 11 & 13: Factory Performance & Cluster UX (April 27, 2026)**:
    - Streaming Copywriter and initial tabbed selector.

## Known Active Issues
- **Intelligence Orphanage**: If a persona is deleted and re-synced from Git, the incremental embedder skips re-embedding due to hash matching against the *old* (now deleted) persona ID. This leaves the new persona record "Untrained." Workaround: Manually edit the file or clear the `documents` table for that file to force a re-hash. (Target Fix: Task 21.9).

## Observability
- **Monitoring**: Structured JSON Logs (Pino).
- **CI**: GitHub Actions CI active on all PRs.
