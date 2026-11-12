import { useMemo, useState, useEffect } from 'react'
import { generateScale } from '../lib/palette'
import { generateDarkScale } from '../lib/darkScale'
import { buildContrastMatrix } from '../lib/contrast'
import type { ContrastPair, TokenScale } from '../types'

const FALLBACK_SEED = '#2563eb'

export interface UsePaletteResult {
  lightScale: TokenScale
  darkScale: TokenScale
  contrastMatrix: ContrastPair[]  // based on light scale
  isValid: boolean
}

/**
 * Core hook — generates both light and dark scales from a single hex seed.
 * Invalid seeds fall back to the default blue without throwing.
 */
export function usePalette(seedHex: string, name = 'primary'): UsePaletteResult {
  // Color picker fires ~60 events/sec while dragging — debounce the expensive computation
  const [settled, setSettled] = useState(seedHex)
  useEffect(() => {
    const id = setTimeout(() => setSettled(seedHex), 120)
    return () => clearTimeout(id)
  }, [seedHex])

  const { lightScale, darkScale, isValid } = useMemo(() => {
    try {
      return {
        lightScale: generateScale(settled, name),
        darkScale:  generateDarkScale(settled, name),
        isValid: true,
      }
    } catch {
      return {
        lightScale: generateScale(FALLBACK_SEED, name),
        darkScale:  generateDarkScale(FALLBACK_SEED, name),
        isValid: false,
      }
    }
  }, [settled, name])

  const contrastMatrix = useMemo(
    () => buildContrastMatrix(lightScale.stops),
    [lightScale],
  )

  return { lightScale, darkScale, contrastMatrix, isValid }
}
