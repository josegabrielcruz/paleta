import { converter, parse } from 'culori'
import type { ColorStop, ContrastPair, ScaleStep } from '../types'

const toRgb = converter('rgb')

// ─── Relative luminance ──────────────────────────────────────────────────────

// IEC 61966-2-1 sRGB linearization
function linearize(c: number): number {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function relativeLuminance(hex: string): number {
  const rgb = toRgb(parse(hex))
  if (!rgb) throw new Error(`contrast: invalid color "${hex}"`)
  const r = linearize(rgb.r ?? 0)
  const g = linearize(rgb.g ?? 0)
  const b = linearize(rgb.b ?? 0)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// ─── Contrast ratio ──────────────────────────────────────────────────────────

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker  = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// ─── WCAG thresholds ─────────────────────────────────────────────────────────

const AA_NORMAL  = 4.5
const AA_LARGE   = 3.0   // large text ≥ 18pt or bold ≥ 14pt; also UI components
const AAA_NORMAL = 7.0

export function checkContrast(
  fgStep: ScaleStep,
  fgHex: string,
  bgStep: ScaleStep,
  bgHex: string,
): ContrastPair {
  const ratio = contrastRatio(fgHex, bgHex)
  return {
    fgStep,
    bgStep,
    ratio: Math.round(ratio * 100) / 100,
    passAA:      ratio >= AA_NORMAL,
    passAALarge: ratio >= AA_LARGE,
    passAAA:     ratio >= AAA_NORMAL,
  }
}

// ─── Full contrast matrix ────────────────────────────────────────────────────

/** Builds every foreground × background pair (skips same-step pairs). */
export function buildContrastMatrix(stops: ColorStop[]): ContrastPair[] {
  const pairs: ContrastPair[] = []
  for (const fg of stops) {
    for (const bg of stops) {
      if (fg.step === bg.step) continue
      pairs.push(checkContrast(fg.step, fg.hex, bg.step, bg.hex))
    }
  }
  return pairs
}

/** Returns only pairs that pass a given threshold. */
export function passingPairs(
  matrix: ContrastPair[],
  level: 'AA' | 'AALarge' | 'AAA' = 'AA',
): ContrastPair[] {
  const key = level === 'AA' ? 'passAA' : level === 'AALarge' ? 'passAALarge' : 'passAAA'
  return matrix.filter(p => p[key])
}
