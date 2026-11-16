# paleta

**Describe your brand. Get a complete design system.**

paleta is an AI-powered color system generator for designers and frontend engineers. Type a plain-language brand description and paleta produces a full OKLCH-based design token system in seconds — including color scales, semantic tokens, contrast matrices, component previews, and multi-format export.

---

## Who it's for

- **Designers** starting a brand or design system from scratch who want a research-backed color foundation fast
- **Frontend engineers** who need a production-ready token system (CSS variables, Tailwind, Figma Tokens, Style Dictionary) without manually tuning every scale step
- **Design systems teams** evaluating color accessibility — paleta runs all colors through WCAG contrast analysis and simulates color vision deficiencies (deuteranopia, protanopia, tritanopia, achromatopsia)

---

## What it does

**AI mode** — describe your brand in plain language:
> "B2B SaaS for finance teams. Professional, trustworthy, modern."

paleta calls a GPT-4o-mini Edge Function, streams back three seed colors (primary, secondary, neutral) with reasoning, then runs the entire engine on the result.

**Manual mode** — pick three seed colors directly and iterate in real time.

Either way, you get:
- **11-stop OKLCH color scales** for each seed (light → dark, perceptually uniform)
- **Semantic token mapping** — background, surface, border, text, primary CTA, accent
- **WCAG contrast matrix** — every scale step pair, AA/AAA pass/fail
- **CVD simulation** — preview the palette under five color vision conditions
- **Component preview** — real UI components rendered with your palette in light and dark modes
- **Multi-format export** — CSS custom properties, Tailwind v3/v4, Figma Tokens, Style Dictionary

---

## Tech stack

- **Vite + React + TypeScript**
- **[culori](https://culorijs.org/)** — OKLCH math, `clampChroma`, perceptual scale generation
- **[Framer Motion](https://www.framer.com/motion/)** — entrance animations, theme toggle, section reveals
- **[Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)** + **[AI SDK](https://sdk.vercel.ai/)** — streaming GPT-4o-mini integration
- **[Zod](https://zod.dev/)** — structured output validation for the AI response

---

## Local development

```bash
npm install
npx vercel dev   # runs Vite + Edge Functions locally
```

Create `.env.local` with your OpenAI key:

```
OPENAI_API_KEY=sk-...
```

> `npm run dev` runs the frontend only — use `vercel dev` to test the AI feature locally.

---

## Deploy

The project is configured for Vercel. Push to `main` and Vercel auto-builds. Set `OPENAI_API_KEY` in your Vercel project's Environment Variables before deploying.
