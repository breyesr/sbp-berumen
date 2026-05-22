# Architecture Plan: Multi-Theme Engine & Layout Lock

## Overview
Implement a robust, scalable theme engine for IntelAgent that allows toggling between the **Institutional (Brand Kit)** style and an **Experimental (Dark/Tech)** style. The primary constraint is **Zero Layout Shift**: the bones of the application (spacing, grid, sizing) must remain identical regardless of the visual skin.

## 1. Technical Strategy: Token-Based Swapping
We will utilize **CSS Variables (Design Tokens)** scoped to data-attributes. By swapping the root data-attribute, the browser will instantly re-map the color and font tokens without a React re-render or layout recalculation.

### The "Theme Contract"
We define a strict set of variable names that every theme **must** implement.

| Token | Description |
| :--- | :--- |
| `--background` | Main page background |
| `--foreground` | Primary text color |
| `--primary` | Main brand accent (Bison Gold vs Indigo) |
| `--surface` | Card/Section backgrounds |
| `--border` | Subtle dividing lines |
| `--font-brand` | Headings/UI typeface |
| `--font-body` | Content/Data typeface |

## 2. Structural Integrity (The "Layout Lock")
To guarantee that the layout won't change, we will move all structural properties into a **Global Immutable Root**.

**Forbidden in Theme Blocks:**
- `width`, `height`, `min-*`, `max-*`
- `padding`, `margin`, `gap`
- `font-size`, `line-height`, `letter-spacing`
- `display`, `position`, `float`

**Allowed in Theme Blocks:**
- `color`, `background-color`, `border-color`
- `box-shadow` (color only)
- `opacity`
- `font-family` (swapping names only)

## 3. Implementation Workflow

### Phase 1: Dependency & Provider Setup
1. Install `next-themes`.
2. Create `src/components/providers/ThemeProvider.tsx` using the `next-themes` Provider.
3. Wrap the root `layout.tsx`.

### Phase 2: CSS Tokenization (globals.css)
1. **Refactor `:root`**: Extract all spacing, radius, and sizing variables.
2. **Define Theme Scopes**:
   - `[data-theme='brand']`: Map the **IntelAgent Brand Kit** (Alabaster, Gold, Black).
   - `[data-theme='experimental']`: Map the **Experimental Skin** (Dark Slate, Indigo, White).
3. **Tailwind v4 Integration**: Map these variables to the `@theme` block in CSS.

### Phase 3: The Toggle Mechanism
1. Create a `ThemeToggle` component.
2. Place it in the `AppHeader` (or a persistent UI location).
3. Implement a "Switching" transition (CSS-based opacity/blur) to ensure the swap feels premium.

### Phase 4: Validation & Audit
1. **Layout Shift Test**: Toggle themes and monitor the DOM for any changes in element dimensions.
2. **Contrast Audit**: Ensure both themes meet WCAG accessibility standards for text readability.
3. **AI Integration**: Update `BRAND_KIT.json` to include references to the token system so future agents use the tokens instead of hex codes.

## 4. Safety Mandates
- **Contract First**: No component shall use hardcoded hex values. Everything must point to a `--var`.
- **SSR Safety**: `next-themes` handles the client-side hydration to prevent the "Dark Mode Flash."
- **Performance**: Zero JS-driven style manipulation. All changes must be CSS-native.
