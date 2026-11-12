import { usePalette, type UsePaletteResult } from './usePalette'

export interface MultiSeeds {
  primary: string
  secondary: string
  neutral: string
}

export interface UseMultiPaletteResult {
  primary: UsePaletteResult
  secondary: UsePaletteResult
  neutral: UsePaletteResult
}

export function useMultiPalette({ primary, secondary, neutral }: MultiSeeds): UseMultiPaletteResult {
  return {
    primary:   usePalette(primary,   'primary'),
    secondary: usePalette(secondary, 'secondary'),
    neutral:   usePalette(neutral,   'neutral'),
  }
}
