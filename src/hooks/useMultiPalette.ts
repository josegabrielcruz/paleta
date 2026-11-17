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

export function useMultiPalette({ primary, secondary, neutral }: MultiSeeds, p3Mode = false): UseMultiPaletteResult {
  return {
    primary:   usePalette(primary,   'primary',   p3Mode),
    secondary: usePalette(secondary, 'secondary', p3Mode),
    neutral:   usePalette(neutral,   'neutral',   p3Mode),
  }
}
