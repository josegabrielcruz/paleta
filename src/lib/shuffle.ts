import { converter, formatHex, clampChroma } from 'culori'
import type { Oklch } from 'culori'

const toHex = formatHex

/** Generates a random perceptually-pleasing primary seed in OKLCH space. */
export function randomSeed(): string {
  const h = Math.random() * 360
  const l = 0.46 + Math.random() * 0.16   // 0.46 – 0.62: mid lightness, good contrast
  const c = 0.17 + Math.random() * 0.11   // 0.17 – 0.28: vivid but not extreme
  const color: Oklch = { mode: 'oklch', l, c, h }
  return toHex(clampChroma(color, 'oklch')) ?? '#2563eb'
}
