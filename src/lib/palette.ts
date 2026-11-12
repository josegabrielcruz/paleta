import { converter, formatHex, parse, clampChroma } from 'culori'
import type { Oklch } from 'culori'
import type { ColorStop, ScaleStep, TokenScale } from '../types'

const toOklch = converter('oklch')

// ─── Scale definition ────────────────────────────────────────────────────────
// Each stop defines a target lightness (l) and a chroma multiplier (cFactor)
// relative to the seed's chroma. The curve peaks at step 600 and falls off
// toward light and dark extremes to stay within sRGB gamut.

const SCALE: Array<{ step: ScaleStep; l: number; cFactor: number }> = [
  { step: 50,  l: 0.975, cFactor: 0.05 },
  { step: 100, l: 0.950, cFactor: 0.10 },
  { step: 200, l: 0.900, cFactor: 0.20 },
  { step: 300, l: 0.825, cFactor: 0.40 },
  { step: 400, l: 0.720, cFactor: 0.65 },
  { step: 500, l: 0.620, cFactor: 0.90 },
  { step: 600, l: 0.520, cFactor: 1.00 }, // peak chroma
  { step: 700, l: 0.415, cFactor: 0.90 },
  { step: 800, l: 0.315, cFactor: 0.75 },
  { step: 900, l: 0.220, cFactor: 0.55 },
  { step: 950, l: 0.155, cFactor: 0.40 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toCssOklch(l: number, c: number, h: number): string {
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(4)} ${h.toFixed(1)})`
}

// ─── Core generator ──────────────────────────────────────────────────────────

/**
 * Generates an 11-stop perceptually uniform color scale from a single hex
 * seed color using OKLCH. Hue is held constant across all stops; lightness
 * varies per the SCALE definition; chroma scales proportionally and is
 * clamped to the sRGB gamut at each stop.
 */
export function generateScale(seedHex: string, name = 'primary'): TokenScale {
  const parsed = parse(seedHex)
  if (!parsed) throw new Error(`generateScale: invalid color "${seedHex}"`)

  const seed = toOklch(parsed)
  if (
    seed === undefined ||
    seed.l === undefined ||
    seed.c === undefined ||
    seed.h === undefined
  ) {
    throw new Error(`generateScale: could not convert "${seedHex}" to OKLCH`)
  }

  const { c: seedC, h: seedH } = seed

  const stops: ColorStop[] = SCALE.map(({ step, l, cFactor }) => {
    const targetC = Math.max(0, seedC * cFactor)

    // Build OKLCH color and clamp to sRGB gamut
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
