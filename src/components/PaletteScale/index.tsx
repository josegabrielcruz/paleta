import { useState, useCallback, useMemo, useRef } from 'react'
import { contrastRatio } from '../../lib/contrast'
import type { TokenScale } from '../../types'
import './PaletteScale.css'

interface PaletteScaleProps {
  scale: TokenScale
}

// Map stop number to its CSS custom property name
const STEP_TO_VAR: Record<number, string> = {
  50: '--ps-50', 100: '--ps-100', 200: '--ps-200', 300: '--ps-300',
  400: '--ps-400', 500: '--ps-500', 600: '--ps-600', 700: '--ps-700',
  800: '--ps-800', 900: '--ps-900', 950: '--ps-950',
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback for environments without clipboard API
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}

export default function PaletteScale({ scale }: PaletteScaleProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleSwatchClick = useCallback(async (step: number, hex: string) => {
    await copyText(hex)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 1200)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      swatchRefs.current[Math.min(index + 1, scale.stops.length - 1)]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      swatchRefs.current[Math.max(index - 1, 0)]?.focus()
    }
  }, [scale.stops.length])

  // Contrast against pure white and pure black for each stop
  const contrastBadges = useMemo(() =>
    Object.fromEntries(
      scale.stops.map(stop => [
        stop.step,
        {
          w: Math.round(contrastRatio(stop.hex, '#ffffff') * 10) / 10,
          b: Math.round(contrastRatio(stop.hex, '#000000') * 10) / 10,
        },
      ])
    ),
    [scale]
  )

  // Build CSS vars object for the @property animated gradient strip
  const cssVars = scale.stops.reduce<Record<string, string>>((acc, stop) => {
    const varName = STEP_TO_VAR[stop.step]
    if (varName) acc[varName] = stop.hex
    return acc
  }, {})

  return (
    <div
      className="palette-scale"
      style={cssVars as React.CSSProperties}
    >
      {/* Signature @property animated gradient strip */}
      <div className="palette-scale__strip" aria-hidden="true" />

      {/* Swatches */}
      <div className="palette-scale__swatches" role="list">
        {scale.stops.map((stop, index) => (
          <button
            key={stop.step}
            ref={el => { swatchRefs.current[index] = el }}
            role="listitem"
            className="palette-scale__swatch"
            style={{ backgroundColor: stop.hex }}
            onClick={() => handleSwatchClick(stop.step, stop.hex)}
            onKeyDown={e => handleKeyDown(e, index)}
            data-copied={copiedStep === stop.step ? 'true' : undefined}
            aria-label={`Step ${stop.step}: ${stop.hex}. Click to copy.`}
            title={`${stop.step} · ${stop.hex}\n${stop.cssOklch}`}
          >
            <div className="palette-scale__overlay" aria-hidden="true">
              <span className="palette-scale__step">{stop.step}</span>
              <span className="palette-scale__hex">{stop.hex}</span>
              <span className="palette-scale__contrast">
                W {contrastBadges[stop.step].w} · B {contrastBadges[stop.step].b}
              </span>
            </div>
            <div className="palette-scale__copied" aria-hidden="true">
              copied
            </div>
          </button>
        ))}
      </div>

      {/* Step number labels */}
      <div className="palette-scale__labels" aria-hidden="true">
        {scale.stops.map(stop => (
          <span key={stop.step} className="palette-scale__label">
            {stop.step}
          </span>
        ))}
      </div>
    </div>
  )
}
