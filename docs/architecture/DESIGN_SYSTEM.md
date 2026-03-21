Design System — Synthetic Persona Web

This design system reflects the current UI for the Idea Stress Test and Copywriter surfaces.

---

1. Colors

Primary Palette
  • Indigo 600 (#4F46E5) → primary actions, focus rings, highlights.
  • Indigo 500 (#6366F1) → hover/active accents.

Base Palette
  • Near‑black (#0A0A0A) → page background.
  • Graphite (#171717) → panels/cards.
  • White (#EDEDED) → primary text.
  • Zinc 400 (#A1A1AA) → secondary text.

Accent Palette
  • Red 400 (#F87171) → errors.
  • Green 400 (#4ADE80) → positive signals.
  • Amber 400 (#FBBF24) → warnings.

---

2. Typography

Font family: Geist Sans (with Geist Mono for code)

Scale (approx)
  • H1 → 32–36px, semibold
  • H2 → 20–24px, semibold
  • H3 → 16–18px, semibold
  • Body → 14–16px, regular
  • Small → 12px, regular

---

3. Spacing & Layout
  • Container max width: 1024px (stress test) and ~900px (copywriter)
  • Card padding: 20–24px
  • Border radius: 12px
  • Borders: subtle 1px white/10% for dark panels

---

4. Components

Buttons
  • Primary: Indigo 600 background, white text, rounded‑lg.
  • Secondary: Transparent with subtle border, indigo hover.
  • Disabled: Reduced opacity, no hover effects.

Inputs
  • Dark translucent background with 1px border.
  • Focus: indigo ring, no heavy shadows.

Cards
  • Dark gradients for result panels.
  • Light border and soft shadow for depth.

---

5. States

Loading
  • Button + inline spinner.

Error
  • Inline red message, no modal blocking.

Empty
  • Subtle instructional text in zinc gray.

---

6. Accessibility

- Maintain text contrast (light on dark).
- Clear focus rings for keyboard navigation.
- Labels above inputs, helper text below.

