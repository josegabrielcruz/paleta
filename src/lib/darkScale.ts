import { converter, formatHex, parse, clampChroma } from 'culori'
import type { Oklch } from 'culori'
import type { ColorStop, ScaleStep, TokenScale } from '../types'

const toOklch = converter('oklch')

// ─── Dark scale definition ───────────────────────────────────────────────────
// Optimized for dark UI surfaces, not a simple inversion of the light scale.
//
// Design intent by zone:
//   50–200  → very dark backgrounds (main surface, elevated surface, card)
//   300–500 → borders, separators, disabled states
//   600–700 → interactive elements, muted text (peak chroma)
//   800–950 → body text, headings — near-white, progressively lighter

const DARK_SCALE: Array<{ step: ScaleStep; l: number; cFactor: number }> = [
  { step: 50,  l: 0.080, cFactor: 0.12 }, // deepest background
  { step: 100, l: 0.115, cFactor: 0.18 }, // elevated surface
  { step: 200, l: 0.165, cFactor: 0.28 }, // subtle bg / selection
  { step: 300, l: 0.230, cFactor: 0.42 }, // subtle border
  { step: 400, l: 0.310, cFactor: 0.58 }, // visible border
  { step: 500, l: 0.420, cFactor: 0.78 }, // disabled / placeholder
  { step: 600, l: 0.530, cFactor: 0.92 }, // mid interactive
  { step: 700, l: 0.640, cFactor: 1.00 }, // peak chroma — brand interactive
  { step: 800, l: 0.750, cFactor: 0.88 }, // solid foreground text
  { step: 900, l: 0.860, cFactor: 0.60 }, // body text
  { step: 950, l: 0.940, cFactor: 0.30 }, // near-white headings
]

function toCssOklch(l: number, c: number, h: number): string {
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(4)} ${h.toFixed(1)})`
}

/**
 * Generates an 11-stop dark-mode scale from a single hex seed using OKLCH.
 * The L-curve is designed for dark surfaces — backgrounds cluster at low L,
 * text and interactive elements at high L. Peak chroma sits at step 700.
 */
export function generateDarkScale(seedHex: string, name = 'primary'): TokenScale {
  const parsed = parse(seedHex)
  if (!parsed) throw new Error(`generateDarkScale: invalid color "${seedHex}"`)

  const seed = toOklch(parsed)
  if (
    seed === undefined ||
    seed.l === undefined ||
    seed.c === undefined ||
    seed.h === undefined
  ) {
    throw new Error(`generateDarkScale: could not convert "${seedHex}" to OKLCH`)
  }

  const { c: seedC, h: seedH } = seed

  const stops: ColorStop[] = DARK_SCALE.map(({ step, l, cFactor }) => {
    const targetC = Math.max(0, seedC * cFactor)
    const raw: Oklch = { mode: 'oklch', l, c: targetC, h: seedH }
    const clamped = clampChroma(raw, 'oklch')

    const cl = clamped.l ?? l
    const cc = clamped.c ?? targetC
    const ch = clamped.h ?? seedH

    return {
      step,
      hex: formatHex(clamped) ?? '#000000',
      oklch: { l: cl, c: cc, h: ch },
      cssOklch: toCssOklch(cl, cc, ch),
    }
  })

  return { seed: seedHex, name, stops }
}
