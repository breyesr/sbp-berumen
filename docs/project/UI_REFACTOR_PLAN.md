# Implementation Plan: UI Refactor "Intelligence Factory 3.0"

This plan outlines the staged transition from a constrained SaaS layout to a full-screen, brand-aligned "Intelligence Factory" experience.

## Phase 1: Foundation (Design System Update)
**Goal:** Align the codebase with Brand Kit 3.0 specs.
- [ ] **1.1. Tailwind Configuration:** Update `tailwind.config.ts` with:
    - Colors: `intelagent-black (#0A0A0A)`, `warm-alabaster (#FAFAF8)`, `bison-gold (#b8975a)`, `sage`, `slate`, `terracotta`.
    - Border Radius: Define `2xl` (1rem / 16px) as the default for cards.
    - Typography: Configure `Geist` tracking and weight presets.
- [ ] **1.2. Global CSS:** Apply `bg-intelagent-black` (or Alabaster) to the root and refine scrollbar aesthetics for the "Matrix" view.

## Phase 2: Shell (Layout & Navigation)
**Goal:** Remove container constraints and implement the new navigation model.
- [ ] **2.1. `AppLayout` Overhaul:** 
    - Remove `max-w-7xl` from the main content wrapper.
    - Implement a flex-row base to support the sidebar.
- [ ] **2.2. Collapsible Sidebar:** Build the `Sidebar` component with:
    - Collapsed state (64px) showing icons for high-frequency actions.
    - Expanded state (240px) for history and admin navigation.
- [ ] **2.3. Intelligence Bar:** Implement the global header that stays thin (56px) and displays current persona/market context.

## Phase 3: Workspace Refactors (Full-Screen Focus)
**Goal:** Redesign primary features to utilize the new space.
- [ ] **3.1. Stress Test "Matrix View":**
    - Transition from a vertical list of cards to a 2-column "Scenario vs. Results" layout.
    - Implement the "Insight Grid" within the results column.
- [ ] **3.2. Copywriter "Side-by-Side":**
    - Redesign the editor to show the "Prompt/Input" pane on the left and the "Persona Preview/Result" pane on the right.

## Phase 4: Theme & Polish
**Goal:** Deliver a high-fidelity, polished finish.
- [ ] **4.1. Theme Engine:** Implement the "Warm Alabaster" theme as a toggleable alternative to "IntelAgent Black."
- [ ] **4.2. Animation & Transition:** Add subtle `framer-motion` transitions for sidebar expansion and card entrance.
- [ ] **4.3. Final Audit:** Ensure all legacy components (Admin tables, Profile) follow the `rounded-2xl` and typography rules.
