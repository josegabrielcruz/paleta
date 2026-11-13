import type { PaletteSuggestion } from './schema'
import type { MultiSeeds } from '../../hooks/useMultiPalette'

// Fallback seeds if any value fails runtime validation
const FALLBACK: MultiSeeds = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  neutral: '#374151',
}

const HEX_RE = /^#[0-9a-f]{6}$/i

function isValidHex(value: string): boolean {
  return HEX_RE.test(value)
}

/** Extract MultiSeeds from a completed AI suggestion, with per-field fallbacks. */
export function extractSeeds(suggestion: PaletteSuggestion): MultiSeeds {
  return {
    primary: isValidHex(suggestion.primary.hex) ? suggestion.primary.hex : FALLBACK.primary,
    secondary: isValidHex(suggestion.secondary.hex) ? suggestion.secondary.hex : FALLBACK.secondary,
    neutral: isValidHex(suggestion.neutral.hex) ? suggestion.neutral.hex : FALLBACK.neutral,
  }
}
