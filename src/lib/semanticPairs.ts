import type { ColorStop, ContrastPair, ScaleStep } from '../types'
import { buildContrastMatrix } from './contrast'

export interface SemanticPairing {
  useCase: string
  description: string
  level: 'AA' | 'AALarge' | 'AAA'
  pair: ContrastPair
  fgStop: ColorStop
  bgStop: ColorStop
}

interface UseCaseDef {
  useCase: string
  description: string
  minLevel: 'AA' | 'AALarge' | 'AAA'
  fgFilter: (s: ScaleStep) => boolean
  bgFilter: (s: ScaleStep) => boolean
}

// Light surface: dark text on light background
const LIGHT_CASES: UseCaseDef[] = [
  {
    useCase: 'Body text',
    description: 'Normal weight text on light background',
    minLevel: 'AA',
    fgFilter: s => s >= 800,
    bgFilter: s => s <= 100,
  },
  {
    useCase: 'UI components',
    description: 'Buttons, links, focus rings',
    minLevel: 'AALarge',
    fgFilter: s => s >= 400 && s <= 700,
    bgFilter: s => s <= 100,
  },
  {
    useCase: 'Muted text',
    description: 'Secondary, placeholder, caption text',
    minLevel: 'AA',
    fgFilter: s => s >= 500 && s <= 750,
    bgFilter: s => s <= 100,
  },
]

// Dark surface: light text on dark background
const DARK_CASES: UseCaseDef[] = [
  {
    useCase: 'Body text',
    description: 'Normal weight text on dark background',
    minLevel: 'AA',
    fgFilter: s => s <= 200,
    bgFilter: s => s >= 800,
  },
  {
    useCase: 'UI components',
    description: 'Buttons, links, focus rings',
    minLevel: 'AALarge',
    fgFilter: s => s >= 300 && s <= 600,
    bgFilter: s => s >= 800,
  },
  {
    useCase: 'Muted text',
    description: 'Secondary, placeholder, caption text',
    minLevel: 'AA',
    fgFilter: s => s >= 300 && s <= 500,
    bgFilter: s => s >= 800,
  },
]

function passes(pair: ContrastPair, level: 'AA' | 'AALarge' | 'AAA'): boolean {
  if (level === 'AAA') return pair.passAAA
  if (level === 'AA') return pair.passAA
  return pair.passAALarge
}

function achievedLevel(pair: ContrastPair): 'AA' | 'AALarge' | 'AAA' {
  if (pair.passAAA) return 'AAA'
  if (pair.passAA) return 'AA'
  return 'AALarge'
}

function resolvePairings(matrix: ContrastPair[], scale: ColorStop[], defs: UseCaseDef[]): SemanticPairing[] {
  const stopMap = new Map(scale.map(s => [s.step, s]))
  const result: SemanticPairing[] = []

  for (const def of defs) {
    const candidates = matrix
      .filter(p => def.fgFilter(p.fgStep) && def.bgFilter(p.bgStep) && passes(p, def.minLevel))
      .sort((a, b) => b.ratio - a.ratio)

    const best = candidates[0]
    if (!best) continue

    const fgStop = stopMap.get(best.fgStep)
    const bgStop = stopMap.get(best.bgStep)
    if (!fgStop || !bgStop) continue

    result.push({ useCase: def.useCase, description: def.description, level: achievedLevel(best), pair: best, fgStop, bgStop })
  }

  return result
}

export function lightSurfacePairings(scale: ColorStop[]): SemanticPairing[] {
  return resolvePairings(buildContrastMatrix(scale), scale, LIGHT_CASES)
}

export function darkSurfacePairings(scale: ColorStop[]): SemanticPairing[] {
  return resolvePairings(buildContrastMatrix(scale), scale, DARK_CASES)
}
