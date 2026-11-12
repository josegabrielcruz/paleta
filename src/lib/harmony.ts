import { converter, formatHex, parse, clampChroma } from 'culori'
import type { Oklch } from 'culori'

const toOklch = converter('oklch')

// ─── Core rotation ───────────────────────────────────────────────────────────

function rotateHue(seedHex: string, degrees: number): string {
  const parsed = parse(seedHex)
  if (!parsed) return seedHex
  const oklch = toOklch(parsed)
  if (!oklch || oklch.l === undefined || oklch.c === undefined || oklch.h === undefined) {
    return seedHex
  }
  const rotated: Oklch = {
    mode: 'oklch',
    l: oklch.l,
    c: oklch.c,
    h: (oklch.h + degrees + 360) % 360,
  }
  return formatHex(clampChroma(rotated, 'oklch')) ?? seedHex
}

// ─── Harmony generators ───────────────────────────────────────────────────────

export function complementary(hex: string): string {
  return rotateHue(hex, 180)
}

export function analogous(hex: string, offset = 30): string {
  return rotateHue(hex, offset)
}

export function triadic(hex: string): string {
  return rotateHue(hex, 120)
}

/** Same hue as primary but heavily desaturated — a tonal neutral companion. */
export function neutralFromPrimary(hex: string): string {
  const parsed = parse(hex)
  if (!parsed) return '#64748b'
  const oklch = toOklch(parsed)
  if (!oklch || oklch.h === undefined) return '#64748b'
  const neutral: Oklch = { mode: 'oklch', l: 0.5, c: 0.028, h: oklch.h }
  return formatHex(clampChroma(neutral, 'oklch')) ?? '#64748b'
}

// ─── Suggestion set for the Secondary picker ─────────────────────────────────

export interface HarmonySuggestion {
  label: string
  hex: string
}

export function getSecondarySuggestions(primaryHex: string): HarmonySuggestion[] {
  return [
    { label: 'Complement', hex: complementary(primaryHex) },
    { label: 'Analogous',  hex: analogous(primaryHex, 30) },
    { label: 'Triadic',    hex: triadic(primaryHex) },
  ]
}
