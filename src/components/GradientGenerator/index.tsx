import { useMemo, useState, useCallback } from 'react'
import type { UseMultiPaletteResult } from '../../hooks/useMultiPalette'
import {
  GRADIENT_DIRECTIONS,
  GRADIENT_KEY_STEPS,
  toOklchGradient,
  toSrgbGradient,
  toOklchGradientCss,
  type GradientDirection,
} from '../../lib/gradient'
import ArrowUpIcon from '@iconify-react/boxicons/arrow-up'
import ArrowUpRightIcon from '@iconify-react/boxicons/arrow-up-right'
import ArrowDownIcon from '@iconify-react/boxicons/arrow-down'
import ArrowDownRightIcon from '@iconify-react/boxicons/arrow-down-right'
import ArrowRightIcon from '@iconify-react/boxicons/arrow-right'
import './GradientGenerator.css'

interface GradientGeneratorProps {
  multiPalette: UseMultiPaletteResult
}

type ScaleSlot = 'primary' | 'secondary' | 'neutral'

export function GradientGenerator({ multiPalette }: GradientGeneratorProps) {
  const [slot, setSlot]           = useState<ScaleSlot>('primary')
  const [direction, setDirection] = useState<GradientDirection>('90deg')
  const [copied, setCopied]       = useState(false)

  const scale = multiPalette[slot].lightScale
  const keyStops = useMemo(
    () => scale.stops.filter(s => (GRADIENT_KEY_STEPS as readonly number[]).includes(s.step)),
    [scale],
  )

  const oklchBg = useMemo(() => toOklchGradient(keyStops, direction), [keyStops, direction])
  const srgbBg  = useMemo(() => toSrgbGradient(keyStops, direction),  [keyStops, direction])
  const cssOut  = useMemo(() => toOklchGradientCss(keyStops, direction), [keyStops, direction])

  const arrowIcon = (value: string) => {
    switch (value) {
      case '0deg':
        return <ArrowUpIcon />
      case '180deg':
        return <ArrowDownIcon />
      case '90deg':
        return <ArrowRightIcon />
      case '45deg':
        return <ArrowUpRightIcon />
      case '135deg':
        return <ArrowDownRightIcon />
    }

    return null
  }

  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(cssOut) } catch { /* silent */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }, [cssOut])

  return (
    <div className="gg">
      <div className="gg-header">
        <span className="gg-eyebrow">Gradients</span>
        <div className="gg-header__line" />

        {/* Scale selector */}
        <div className="gg-toggle" role="group" aria-label="Select scale">
          {(['primary', 'secondary', 'neutral'] as const).map(s => (
            <button
              key={s}
              className={`gg-toggle__btn${slot === s ? ' gg-toggle__btn--active' : ''}`}
              onClick={() => setSlot(s)}
              aria-pressed={slot === s}
            >{s}</button>
          ))}
        </div>

        {/* Direction selector */}
        <div className="gg-directions" role="group" aria-label="Gradient direction">
          {GRADIENT_DIRECTIONS.map(d => (
            <button
              key={d.value}
              className={`gg-dir-btn${direction === d.value ? ' gg-dir-btn--active' : ''}`}
              onClick={() => setDirection(d.value)}
              aria-label={`Direction ${d.value}`}
              aria-pressed={direction === d.value}
            >{arrowIcon(d.value)}</button>
          ))}
        </div>
      </div>

      {/* Comparison strips */}
      <div className="gg-comparison">
        <div className="gg-comparison__row">
          <span className="gg-comparison__label">OKLCH</span>
          <div className="gg-comparison__bar" style={{ background: oklchBg }} aria-hidden="true" />
        </div>
        <div className="gg-comparison__row">
          <span className="gg-comparison__label">sRGB</span>
          <div className="gg-comparison__bar" style={{ background: srgbBg }} aria-hidden="true" />
        </div>
      </div>

      <p className="gg-hint">
        OKLCH stays on the perceptual color path — no gray, muddy middle.
      </p>

      {/* CSS output */}
      <div className="gg-output">
        <pre className="gg-output__code">{cssOut}</pre>
        <button className="gg-output__copy" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
