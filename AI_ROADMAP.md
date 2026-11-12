# paleta — AI Feature Roadmap

**Feature:** Natural language → complete OKLCH design system in seconds.

**Core UX:** User types a brand description → AI suggests 3 seed colors with reasoning → existing Paleta engine generates the full token system, contrast matrix, component preview, and export.

---

## Why this differentiates

Every other palette tool asks you to bring a *color*. This asks you to bring an *intention*. The AI layer handles the translation from brand identity to OKLCH values; the existing Paleta engine handles everything after.

---

## Phase AI-0 — Infrastructure Migration

Move from GitHub Pages (pure static) to Vercel to enable serverless Edge Functions.

### Tasks

- [ ] Add `vercel.json` to configure the project
- [ ] Remove `.github/workflows/deploy.yml` or update to Vercel GitHub integration
- [ ] Confirm `vite.config.ts` base path works correctly on Vercel (no `base: '/paleta/'` needed)
- [ ] Set up `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`) in Vercel environment variables
- [ ] Verify existing build + deploy pipeline works on Vercel

### Notes

- Vite + React setup is unchanged — Vercel auto-detects it
- The `api/` directory at project root becomes serverless functions automatically
- No `next.js` migration needed; Vite SPA + `/api` works natively on Vercel

---

## Phase AI-1 — Edge Function + AI SDK

Build the backend proxy that keeps the API key server-side.

### Dependencies

```bash
npm install ai @ai-sdk/openai
```

### Tasks

- [ ] Create `api/suggest.ts` — Vercel Edge Function
- [ ] Define the structured output schema (Zod) for the AI response
- [ ] Write the system prompt (see Prompt Design section below)
- [ ] Implement streaming response using Vercel AI SDK `streamText`
- [ ] Add basic input validation (max length, strip dangerous content)
- [ ] Add rate limiting via Vercel Edge middleware (`api/_middleware.ts`)
- [ ] Test locally with `vercel dev`

### File: `api/suggest.ts`

```ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { SYSTEM_PROMPT } from '../src/lib/ai/prompt'

export const runtime = 'edge'
export const maxDuration = 30

export async function POST(req: Request) {
  const { description } = await req.json()

  if (!description || typeof description !== 'string' || description.length > 500) {
    return new Response('Invalid input', { status: 400 })
  }

  return streamText({
    model: openai('gpt-4o-mini'),
    system: SYSTEM_PROMPT,
    prompt: description.trim(),
    maxTokens: 600,
  }).toDataStreamResponse()
}
```

### Prompt Design

The system prompt must:
1. Ground the LLM in color theory and OKLCH constraints
2. Require valid hex output (the OKLCH engine validates/clamps internally)
3. Ask for concise reasoning, not essays
4. Reference real brands for calibration

```
src/lib/ai/
  prompt.ts          ← System prompt constant
  schema.ts          ← Zod schema for the structured JSON response
  parseResponse.ts   ← Extracts hex values + reasoning from streamed text
```

**Structured response format the LLM must return:**
```json
{
  "strategy": "One sentence on overall color direction",
  "primary":   { "hex": "#2563eb", "reasoning": "..." },
  "secondary": { "hex": "#7c3aed", "reasoning": "..." },
  "neutral":   { "hex": "#475569", "reasoning": "..." }
}
```

---

## Phase AI-2 — Frontend Hook

Client-side logic that calls `/api/suggest` and manages streaming state.

### Tasks

- [ ] Create `src/hooks/useAISuggest.ts`
- [ ] Handle streaming chunks from the AI SDK's client helper
- [ ] Parse the JSON response as it streams (progressive JSON parsing)
- [ ] Expose states: `idle | loading | streaming | done | error`
- [ ] Extract the 3 hex values + strategy text + per-color reasoning
- [ ] Handle error states gracefully (API quota, network failure)

### Hook API

```ts
interface AISuggestion {
  strategy: string
  seeds: { primary: string; secondary: string; neutral: string }
  reasoning: { primary: string; secondary: string; neutral: string }
}

interface UseAISuggestReturn {
  status: 'idle' | 'loading' | 'streaming' | 'done' | 'error'
  suggestion: AISuggestion | null
  streamingText: string         // raw streaming content for display
  error: string | null
  generate: (description: string) => void
  reset: () => void
}
```

---

## Phase AI-3 — BrandInput UI Component

The visible feature — a text input above the existing SeedRow.

### Component structure

```
src/components/BrandInput/
  index.tsx
  BrandInput.css
```

### Visual design

```
┌────────────────────────────────────────────────────────────┐
│  Describe your brand or product                            │
│  "productivity app for developers, serious but not cold"   │
│                                              [Generate ✦]  │
└────────────────────────────────────────────────────────────┘

[streaming / done state]
─────────────────────────────────────────────────────────────
  Strategy: "Anchored by deep indigo to signal focus..."

  ● Primary     #4f46e5   ████   "Signals depth and precision..."
  ● Secondary   #0ea5e9   ████   "Adds energy without competing..."
  ● Neutral     #374151   ████   "Warm enough to avoid sterility..."

  [Apply these colors]  [Regenerate]
─────────────────────────────────────────────────────────────
```

### Tasks

- [ ] Text area with placeholder examples (3 rotating suggestions)
- [ ] "Generate ✦" button with loading/streaming states
- [ ] Streaming reasoning panel — text appears word by word as AI responds
- [ ] Color preview swatches update as hex values are parsed from the stream
- [ ] "Apply these colors" button → calls `setSeeds({ primary, secondary, neutral })`
- [ ] "Regenerate" button → reruns with the same description
- [ ] Animate the transition: swatch colors animate from old → new using existing `@property` mechanics
- [ ] Error state with friendly message
- [ ] `prefers-reduced-motion` respected — disable typing animation

### Example prompts to show as placeholders

```
"B2B SaaS for finance teams. Professional, trustworthy, modern."
"Consumer fitness app. Energetic, motivating, not intimidating."
"Developer tooling startup. Dark mode primary. Think Linear, not Jira."
"Luxury e-commerce. Minimal, editorial, high-contrast."
```

---

## Phase AI-4 — Integration into App

Wire `BrandInput` into the top of the page, above `SeedRow`.

### Tasks

- [ ] Import `BrandInput` in `App.tsx`
- [ ] Place it above `SeedRow` with a visual separator
- [ ] The "Apply" action calls `setSeeds()` — the entire existing pipeline runs from there
- [ ] The `SeedRow` and `DiscoveryBar` remain fully functional independently
- [ ] Update the `StickyControls` to show an AI indicator when seeds were AI-generated
- [ ] Add `?ai=1` to the share URL when AI was used (for analytics context)

---

## Phase AI-5 — "Palette Card" Shareable Output

The LinkedIn moment: a visual card showing the brand description + generated palette.

### Tasks

- [ ] Design a `PaletteCard` component:
  - Brand description quoted at top
  - 3 scale strip previews (primary/secondary/neutral light scales)
  - AI strategy text
  - "Generated with paleta" attribution + share URL
- [ ] "Copy as image" button using `html2canvas` or `dom-to-image`
- [ ] Optionally: generate via Vercel OG image endpoint (Phase 11 from main roadmap)

This is the shareable artifact — the thing that gets posted on LinkedIn.

---

## Prompt Engineering Notes

### Key constraints to include in system prompt

1. **Return valid hex only** — no oklch, no hsl, no named colors. The existing engine converts.
2. **Avoid pure white/black/gray for primary and secondary** — they won't generate interesting OKLCH scales.
3. **Consider competitor differentiation** — if user mentions "like Stripe" don't return blue.
4. **Lightness guidance** — OKLCH L 0.45–0.65 for primary/secondary generates the most useful 11-stop scale.
5. **Neutral guidance** — L ≈ 0.50, C ≈ 0.02–0.04, same H as primary (tonal neutral).
6. **Reasoning must be specific** — not "blue signals trust" but "this hue sits at 258° in OKLCH, adjacent to Notion and Linear but lighter at L=0.52 to avoid the corporate navy trap."

### Model choice rationale

- **gpt-4o-mini**: Fast (< 2s), cheap (~$0.00002/request), good enough for structured color recommendations. Use this.
- **claude-haiku**: Comparable alternative if Anthropic is preferred.
- **gpt-4o**: Overkill for this task, 20× more expensive. Not needed.

---

## Rate Limiting Strategy

```ts
// api/_middleware.ts
// 10 requests per IP per hour using Vercel KV (free tier)
// Hard limit: 1000 requests/day total (cost guardrail ≈ $0.02/day at scale)
```

Options in order of complexity:
1. **Vercel KV** (simplest) — built-in key-value store, free tier generous enough
2. **Upstash Redis** — slightly more control, same free tier range
3. **IP-based headers only** — no persistence, resets on cold start (not reliable but zero cost)

---

## Success Metrics

- **Time to first palette from description:** < 3 seconds (streaming starts in < 1s)
- **Hex validity rate:** 100% (Paleta's culori engine clamps invalid values gracefully)
- **Apply → visible palette generation:** < 200ms (existing engine, unchanged)
- **Cost per 1000 requests:** < $0.03

---

## Build Order

```
Phase AI-0  →  Infrastructure migration to Vercel
Phase AI-1  →  Edge Function + AI SDK + prompt
Phase AI-2  →  useAISuggest hook
Phase AI-3  →  BrandInput UI component
Phase AI-4  →  App integration
Phase AI-5  →  Shareable palette card
```
