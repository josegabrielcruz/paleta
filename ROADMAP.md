# paleta — Feature Roadmap

Ordered by build priority. Engine is complete; UI components and features build on top of it.

---

## ✅ Phase 0 — Engine (complete)

| File | What it does |
|---|---|
| `src/types.ts` | `ColorStop`, `TokenScale`, `ScaleStep`, `ContrastPair`, `ExportFormat` |
| `src/lib/palette.ts` | `generateScale(seedHex)` → 11-stop OKLCH scale with gamut clamping |
| `src/lib/contrast.ts` | WCAG relative luminance, `contrastRatio()`, `buildContrastMatrix()` |
| `src/hooks/usePalette.ts` | `usePalette(seedHex)` → `{ scale, contrastMatrix, isValid }` |

---

## 🔨 Phase 1 — Foundation UI

Global styles, design tokens for the app itself, and the two primary input components.

- [ ] `src/styles/global.css` — reset, CSS custom properties for app chrome (not the generated palette)
- [ ] `SeedColorInput` — native color picker + hex text input + live validation
- [ ] `PaletteScale` — the swatch row
  - Hover reveals `step`, `hex`, `oklch()` string
  - Click to copy (hex, then oklch on double-click)
  - `@property`-animated gradient strip beneath the row — this is the signature visual: registers `--palette-stop-N` as `<color>` typed properties and animates between them as seed changes
  - Transition animation when seed color changes (swatches cross-fade)

---

## 🎨 Phase 2 — Dark / Light Mode Pair *(highest impact)*

Generate both light and dark themes from a single seed simultaneously.

- [ ] `src/lib/darkScale.ts` — `generateDarkScale(seedHex)`: inverted lightness curve, adjusted chroma for dark surfaces
- [ ] `usePalette` extended to return `{ lightScale, darkScale }`
- [ ] `DarkLightPair` component — shows both scales side by side with a toggle to flip preview
- [ ] Dark/light preview pane: renders a realistic UI shell (nav, card, sidebar) in each theme

---

## 🎯 Phase 3 — Semantic Token Mapping

Map the raw numeric scale to the named tokens design systems actually use.

- [ ] `src/lib/tokens.ts` — `mapToSemanticTokens(scale, darkScale)` 
  Maps stops to: `background`, `surface`, `border`, `text-primary`, `text-secondary`, `primary`, `primary-hover`, `accent`, `muted`
- [ ] `SemanticTokenGrid` component — shows token name → swatch → hex/oklch for both light and dark
- [ ] Semantic overrides: let users manually reassign which step maps to which token

---

## 🔴🟡🟢 Phase 4 — Contrast Matrix *(accessibility engineering signal)*

Full foreground × background grid — every combination, not just inline failures.

- [ ] `ContrastMatrix` component — `n × n` grid of all stops
  - Cell colored by pass level: AAA (green) / AA (blue) / AA Large (amber) / fail (red)
  - Cell shows ratio on hover
  - Filter controls: show only AA passes, only failures, etc.
- [ ] Contrast badge on each swatch showing its worst-case ratio against white and black

---

## 🖥️ Phase 5 — UI Component Preview *(design systems signal)*

Render realistic components using the generated tokens — not abstract swatches.

- [ ] `ComponentPreview` — renders a small design system component kit in the generated tokens:
  - Primary button (filled, outline, ghost)
  - Badge / tag
  - Card with title + body text + action
  - Form input with label + error state
  - Alert (info, success, warning, error using semantic tokens)
- [ ] Toggle between light and dark mode in the preview pane

---

## 📤 Phase 6 — Export

- [ ] `src/lib/export.ts` — all formatters:
  - `toCssVars(scale)` — CSS custom properties (`--color-primary-500: oklch(...)`)
  - `toTailwindV3(scale)` — `extend.colors` object
  - `toTailwindV4(scale)` — CSS variables format (v4's native approach)
  - `toFigmaTokens(scale)` — Figma Tokens plugin JSON
  - `toStyleDictionary(scale)` — Style Dictionary config format
- [ ] `ExportPanel` component — format selector + live code preview + copy button
- [ ] Download as file button (`.css`, `.json`, `.js`)

---

## 🌈 Phase 7 — Multiple Seed Colors

Primary + Secondary + Neutral seeds for a full multi-brand palette.

- [ ] `usePalette` extended to accept `{ primary, secondary, neutral }` seeds
- [ ] `SeedRow` component — three pickers side by side, labels, harmony suggestions
- [ ] Harmony picker: complementary, analogous, triadic auto-fill for secondary seed
- [ ] All export formats updated to include all three scales

---

## 👁️ Phase 8 — Color Blindness Simulation

- [ ] `src/lib/simulate.ts` — SVG filter matrices for deuteranopia, protanopia, tritanopia, achromatopsia
- [ ] `SimulateMode` toggle — wraps the entire palette + preview pane in an SVG filter
- [ ] Side-by-side mode: show original and simulated palettes simultaneously

---

## 🎲 Phase 9 — Discovery & Share

- [ ] `Shuffle` button — picks a harmonically pleasing random seed using OKLCH hue rotation
- [ ] Preset palette library — 8–10 curated starting points (warm, cool, neutral, vivid, muted, earth tones, etc.)
- [ ] **Share URL** — encodes full state in the URL:
  `paleta.dev/?p=2563eb&s=e83e5a&n=64748b&mode=dark`
  Decoded on load so every palette is shareable by link

---

## ✨ Phase 10 — Polish

- [ ] Install Framer Motion + component entrance animations (scroll-triggered fade-in with `useInView`)
- [ ] Keyboard navigation — arrow keys move focus between swatches in `PaletteScale`
- [ ] `prefers-reduced-motion` respected via `useReducedMotion()` — all Framer Motion animations collapse to instant
- [ ] Mobile layout — responsive CSS for SeedRow, SemanticTokenGrid, ThemePreview panes
- [ ] `@property` gradient animation fine-tuning — interpolation should feel liquid
- [ ] **Combined theme preview** — sources tokens from all three scales simultaneously

---

## ♿ Phase 12 — WCAG Recommended Pairings

Turn the contrast matrix data into actionable guidance.

- [ ] `passingPairs(matrix, 'AA')` already built — extend it to filter only semantically meaningful pairings (foreground text roles against background roles)
- [ ] `RecommendedPairs` section below the contrast matrix showing: "Body text: use step 900 on step 50 — 14.3:1 AAA"
- [ ] Group by use case: headings, body text, UI components (AA Large), disabled text
- [ ] Each recommendation shows the swatch pair, ratio, and WCAG level badge
- [ ] Light and dark variants shown together

---

## 🎨 Phase 13 — Accessible Pair Badges on ComponentPreview

Directly answer "is this safe to ship?" inside the preview.

- [ ] Compute actual contrast ratios for each rendered text/background pair in ComponentPreview
  - Button label vs button background
  - Card title/body vs card surface
  - Form label vs page background
  - Alert text vs alert background
- [ ] Render small inline badges: `4.5:1 AA` or `7.1:1 AAA` or `2.3:1 ✗`
- [ ] Badges update live when palette or mode changes
- [ ] Visually unobtrusive — only shown on hover or as a small corner indicator

---

## 🖥️ Phase 14 — P3 / Display-P3 Mode

Generate richer, more vivid palettes for wide-gamut displays.

- [ ] Add a "P3" toggle to the app — when active, disables sRGB gamut clamping in `generateScale` and `generateDarkScale`
- [ ] Use `color-mix(in display-p3, ...)` or bare `oklch()` values without clamp in CSS output
- [ ] Export formats updated: CSS vars mode emits `@supports (color: oklch(0 0 0))` block with P3 values alongside sRGB fallbacks
- [ ] Contrast matrix recalculates using P3-relative luminance when P3 mode is active
- [ ] Visual indicator when a generated color exceeds the sRGB gamut

---

## 🖼 Phase 11 — OG Images *(post-deployment)*

- [ ] Dynamic OG image generation per share URL using Vercel Edge Functions + Satori
  - Input: `?p=hex&s=hex&n=hex` query params
  - Output: 1200×630 image showing the three palette scale strips
  - Fallback: static OG image for the default palette

---

## Build order summary

```
Phase 0  ✅  Engine
Phase 1  →   Foundation UI + PaletteScale + @property gradient
Phase 2  →   Dark/light pair
Phase 3  →   Semantic tokens
Phase 4  →   Contrast matrix
Phase 5  →   UI component preview
Phase 6  →   Export panel
Phase 7  →   Multiple seeds
Phase 8  →   Color blindness simulation
Phase 9  →   Shuffle + share URL
Phase 10 →   Polish pass
```
