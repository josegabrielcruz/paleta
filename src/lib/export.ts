import type { TokenScale, ColorStop } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cssVarName(name: string, step: number): string {
  return `--color-${name}-${step}`
}

function indent(n: number): string {
  return ' '.repeat(n)
}

// ─── CSS custom properties ────────────────────────────────────────────────────

export function toCssVars(scale: TokenScale): string {
  const lines = scale.stops.map(
    (s: ColorStop) => `${indent(2)}${cssVarName(scale.name, s.step)}: ${s.cssOklch};`,
  )
  return `:root {\n${lines.join('\n')}\n}`
}

export function toCssVarsMulti(scales: TokenScale[]): string {
  const lines = scales.flatMap(scale =>
    scale.stops.map(
      (s: ColorStop) => `${indent(2)}${cssVarName(scale.name, s.step)}: ${s.cssOklch};`,
    ),
  )
  return `:root {\n${lines.join('\n')}\n}`
}

// ─── Tailwind v3 (extend.colors) ─────────────────────────────────────────────

/**
 * Outputs a JS object suitable for tailwind.config.js `theme.extend.colors`:
 *   {
 *     primary: {
 *       50: '#f0f9ff',
 *       ...
 *     }
 *   }
 */
export function toTailwindV3(scale: TokenScale): string {
  const stops = scale.stops
    .map((s: ColorStop) => `${indent(6)}'${s.step}': '${s.hex}',`)
    .join('\n')
  return (
    `// tailwind.config.js — theme.extend.colors\n` +
    `{\n` +
    `${indent(2)}'${scale.name}': {\n` +
    `${stops}\n` +
    `${indent(2)}},\n` +
    `}`
  )
}

// ─── Tailwind v4 (CSS vars) ───────────────────────────────────────────────────

/**
 * Tailwind v4 uses CSS variables natively via @theme.
 * Outputs:
 *   @theme {
 *     --color-primary-50: oklch(...);
 *     ...
 *   }
 */
export function toTailwindV4(scale: TokenScale): string {
  const lines = scale.stops.map(
    (s: ColorStop) => `${indent(2)}${cssVarName(scale.name, s.step)}: ${s.cssOklch};`,
  )
  return `@theme {\n${lines.join('\n')}\n}`
}

export function toTailwindV4Multi(scales: TokenScale[]): string {
  const lines = scales.flatMap(scale =>
    scale.stops.map(
      (s: ColorStop) => `${indent(2)}${cssVarName(scale.name, s.step)}: ${s.cssOklch};`,
    ),
  )
  return `@theme {\n${lines.join('\n')}\n}`
}

// ─── Figma Tokens ─────────────────────────────────────────────────────────────

export function toFigmaTokens(scale: TokenScale): string {
  const tokens: Record<string, { type: string; value: string }> = {}
  for (const s of scale.stops) {
    tokens[`${scale.name}/${s.step}`] = { type: 'color', value: s.hex }
  }
  return JSON.stringify({ [scale.name]: tokens }, null, 2)
}

export function toFigmaTokensMulti(scales: TokenScale[]): string {
  const root: Record<string, Record<string, { type: string; value: string }>> = {}
  for (const scale of scales) {
    root[scale.name] = {}
    for (const s of scale.stops) {
      root[scale.name][`${scale.name}/${s.step}`] = { type: 'color', value: s.hex }
    }
  }
  return JSON.stringify(root, null, 2)
}

// ─── Style Dictionary ─────────────────────────────────────────────────────────

export function toStyleDictionary(scale: TokenScale): string {
  const steps: Record<string, { value: string; attributes: { oklch: string } }> = {}
  for (const s of scale.stops) {
    steps[String(s.step)] = { value: s.hex, attributes: { oklch: s.cssOklch } }
  }
  return JSON.stringify({ color: { [scale.name]: steps } }, null, 2)
}

export function toStyleDictionaryMulti(scales: TokenScale[]): string {
  const color: Record<string, Record<string, { value: string; attributes: { oklch: string } }>> = {}
  for (const scale of scales) {
    color[scale.name] = {}
    for (const s of scale.stops) {
      color[scale.name][String(s.step)] = { value: s.hex, attributes: { oklch: s.cssOklch } }
    }
  }
  return JSON.stringify({ color }, null, 2)
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

export type ExportFormatId = 'css' | 'tailwind' | 'tailwind-v4' | 'figma' | 'style-dictionary'

export interface ExportFormatMeta {
  id: ExportFormatId
  label: string
  fileExt: string
  mimeType: string
  generate: (scale: TokenScale) => string
  generateMulti: (scales: TokenScale[]) => string
}

export const EXPORT_FORMATS: ExportFormatMeta[] = [
  {
    id: 'css',
    label: 'CSS Variables',
    fileExt: 'css',
    mimeType: 'text/css',
    generate: toCssVars,
    generateMulti: toCssVarsMulti,
  },
  {
    id: 'tailwind',
    label: 'Tailwind v3',
    fileExt: 'js',
    mimeType: 'text/javascript',
    generate: toTailwindV3,
    generateMulti: (scales) => scales.map(toTailwindV3).join('\n\n'),
  },
  {
    id: 'tailwind-v4',
    label: 'Tailwind v4',
    fileExt: 'css',
    mimeType: 'text/css',
    generate: toTailwindV4,
    generateMulti: toTailwindV4Multi,
  },
  {
    id: 'figma',
    label: 'Figma Tokens',
    fileExt: 'json',
    mimeType: 'application/json',
    generate: toFigmaTokens,
    generateMulti: toFigmaTokensMulti,
  },
  {
    id: 'style-dictionary',
    label: 'Style Dictionary',
    fileExt: 'json',
    mimeType: 'application/json',
    generate: toStyleDictionary,
    generateMulti: toStyleDictionaryMulti,
  },
]
