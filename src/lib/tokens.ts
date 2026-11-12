import type { TokenScale, ScaleStep } from '../types'

// ─── Semantic token names ────────────────────────────────────────────────────

export type SemanticToken =
  | 'background'
  | 'surface'
  | 'border'
  | 'text-primary'
  | 'text-secondary'
  | 'primary'
  | 'primary-hover'
  | 'accent'
  | 'muted'

export interface ResolvedToken {
  name: SemanticToken
  description: string
  step: ScaleStep
  hex: string
  cssOklch: string
}

export interface SemanticTokenMap {
  light: ResolvedToken[]
  dark: ResolvedToken[]
}

export type ModeOverrides = Partial<Record<SemanticToken, ScaleStep>>

export interface TokenOverrides {
  light: ModeOverrides
  dark: ModeOverrides
}

// ─── Metadata ────────────────────────────────────────────────────────────────

const TOKEN_META: Record<SemanticToken, string> = {
  'background':     'Page and canvas background',
  'surface':        'Card, panel, elevated surface',
  'border':         'Default dividers and borders',
  'text-primary':   'Headings and high-emphasis text',
  'text-secondary': 'Body copy and secondary labels',
  'primary':        'Brand CTA and interactive',
  'primary-hover':  'Brand hover and active state',
  'accent':         'Decorative highlights',
  'muted':          'Placeholder and disabled states',
}

export const SEMANTIC_TOKENS: readonly SemanticToken[] = [
  'background',
  'surface',
  'border',
  'text-primary',
  'text-secondary',
  'primary',
  'primary-hover',
  'accent',
  'muted',
]

// ─── Default step mappings ───────────────────────────────────────────────────

export const LIGHT_DEFAULTS: Record<SemanticToken, ScaleStep> = {
  'background':     50,
  'surface':        100,
  'border':         200,
  'text-primary':   900,
  'text-secondary': 600,
  'primary':        600,
  'primary-hover':  700,
  'accent':         400,
  'muted':          300,
}

export const DARK_DEFAULTS: Record<SemanticToken, ScaleStep> = {
  'background':     50,
  'surface':        100,
  'border':         300,
  'text-primary':   950,
  'text-secondary': 700,
  'primary':        700,
  'primary-hover':  600,
  'accent':         600,
  'muted':          200,
}

// ─── Resolver ────────────────────────────────────────────────────────────────

function resolveMode(
  scale: TokenScale,
  defaults: Record<SemanticToken, ScaleStep>,
  overrides: ModeOverrides,
): ResolvedToken[] {
  return SEMANTIC_TOKENS.map(name => {
    const step = overrides[name] ?? defaults[name]
    const stop = scale.stops.find(s => s.step === step)!
    return {
      name,
      description: TOKEN_META[name],
      step,
      hex: stop.hex,
      cssOklch: stop.cssOklch,
    }
  })
}

export function mapToSemanticTokens(
  lightScale: TokenScale,
  darkScale: TokenScale,
  overrides: TokenOverrides = { light: {}, dark: {} },
): SemanticTokenMap {
  return {
    light: resolveMode(lightScale, LIGHT_DEFAULTS, overrides.light),
    dark:  resolveMode(darkScale,  DARK_DEFAULTS,  overrides.dark),
  }
}

// ─── Mixed resolver (3-scale system theme) ───────────────────────────────────
// Neutral scale → structural tokens (bg, surface, border, text, muted)
// Primary scale → brand tokens (primary, primary-hover)
// Secondary scale → accent token

export function mapToMixedSemanticTokens(
  neutralLight: TokenScale,
  neutralDark:  TokenScale,
  primaryLight: TokenScale,
  primaryDark:  TokenScale,
  secondaryLight: TokenScale,
  secondaryDark:  TokenScale,
): SemanticTokenMap {
  function resolveMixed(
    neutralStops: TokenScale['stops'],
    primaryStops: TokenScale['stops'],
    secondaryStops: TokenScale['stops'],
    defaults: Record<SemanticToken, ScaleStep>,
  ): ResolvedToken[] {
    return SEMANTIC_TOKENS.map(name => {
      const step = defaults[name]
      // Route each semantic role to its responsible scale
      const sourceStops =
        name === 'primary' || name === 'primary-hover'  ? primaryStops :
        name === 'accent'                                ? secondaryStops :
        neutralStops
      const stop = sourceStops.find(s => s.step === step)!
      return { name, description: TOKEN_META[name], step, hex: stop.hex, cssOklch: stop.cssOklch }
    })
  }

  return {
    light: resolveMixed(neutralLight.stops, primaryLight.stops, secondaryLight.stops, LIGHT_DEFAULTS),
    dark:  resolveMixed(neutralDark.stops,  primaryDark.stops,  secondaryDark.stops,  DARK_DEFAULTS),
  }
}
