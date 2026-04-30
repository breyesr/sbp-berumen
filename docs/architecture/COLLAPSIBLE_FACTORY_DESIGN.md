# Design Spec: Collapsible Intelligence Factory (Epic 14)

## Overview
Transform the monolithic Stress Test form into a high-impact, collapsible accordion-style workflow. The goal is to reduce cognitive load while maintaining an "Obsidian-like" aesthetic with fluid transitions.

## 1. Interaction Model: The Collapsible Accordion
- **Non-Paginated**: All sections reside on the same page; only the `currentStep` is expanded.
- **Summary Badges**: Collapsed sections display a summary of their current state (e.g., "Target: Alejandro | Intensity: Direct").
- **Auto-Flow**: 
    - Completing Section 1 (Identity) auto-expands Section 2 (Strategy).
    - Submitting Section 2 auto-expands Section 3 (Results) as streaming begins.

## 2. Component Anatomy

### 2.1 IdentitySection ("Choose Your Fighter")
- **Grid**: 3-column responsive grid of `PersonaCard` components.
- **PersonaCard**:
    - Centralized avatar icon.
    - Name (Bold White), Cluster (Indigo-400), Role (Italic Muted).
    - `(i) DOSSIER` button at the bottom (triggers modal).
    - Selected state: Indigo border + checkmark badge.
- **Intelligence Intensity**: Standard select dropdown for challenge level.
- **Action**: "Continue to Input" (Centered button).

### 2.2 StrategySection (The Factory Floor)
- **Fields**: Pitch, Goal, Strategic Focus (Textareas).
- **Intelligence Assistant**: `(i)` icons next to labels.
- **Tooltips**: Glassmorphism cards showing:
    - **Expectation**: What to write.
    - **Mechanism**: How it affects the DSE score.
    - **Example**: A high-rigor sample.
- **Action**: "Execute Stress Test" (High-contrast button).

### 2.3 ResultsSection (Intelligence Output)
- **Loading**: Shimmer skeleton loader for the DSE breakdown.
- **Content**: `AnalysisResults` component (streaming).

### 2.4 RefinementSection (Strategy Pivot)
- **Content**: `RefinementPanel` (Static collapsible).

## 3. Technical Requirements
- **State**: `currentStep: 'identity' | 'strategy' | 'results' | 'refinement'`.
- **Animations**: `framer-motion` for height transitions.
- **UX**: `scrollIntoView` management to frame expanding sections.
- **Aesthetic**: Obsidian Black (`#0a0a0a`), Indigo accents (`#4F46E5`), Glassmorphism effects.
