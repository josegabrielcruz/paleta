import type { ColorStop } from '../types'

export type GradientDirection = '90deg' | '135deg' | '180deg' | '45deg' | '0deg'

export const GRADIENT_DIRECTIONS: { value: GradientDirection; label: string }[] = [
  { value: '90deg',  label: '→' },
  { value: '45deg',  label: '↗' },
  { value: '0deg',   label: '↑' },
  { value: '135deg', label: '↘' },
  { value: '180deg', label: '↓' },
]

/** Key stops for a visually representative gradient (light → dark) */
export const GRADIENT_KEY_STEPS = [100, 300, 500, 700, 900] as const

/** CSS gradient using perceptually-uniform OKLCH interpolation */
export function toOklchGradient(stops: ColorStop[], direction: GradientDirection): string {
  return `linear-gradient(${direction} in oklch, ${stops.map(s => s.cssOklch).join(', ')})`
}

/** Identical gradient but interpolated in sRGB — for comparison */
export function toSrgbGradient(stops: ColorStop[], direction: GradientDirection): string {
  return `linear-gradient(${direction}, ${stops.map(s => s.hex).join(', ')})`
}

/** Formatted multi-line CSS output for display */
export function toOklchGradientCss(stops: ColorStop[], direction: GradientDirection): string {
  const colorLines = stops.map(s => `  ${s.cssOklch}`).join(',\n')
  return `/* oklch gradients — Chrome 111+, Safari 16.2+, Firefox 113+ */\nbackground: linear-gradient(\n  ${direction} in oklch,\n${colorLines}\n);`
}
