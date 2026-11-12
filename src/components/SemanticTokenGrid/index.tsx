import { useMemo, useState, useCallback } from 'react'
import {
  mapToSemanticTokens,
  SEMANTIC_TOKENS,
  type SemanticToken,
  type TokenOverrides,
} from '../../lib/tokens'
import type { TokenScale, ColorStop, ScaleStep } from '../../types'
import './SemanticTokenGrid.css'

// ─── Step picker ─────────────────────────────────────────────────────────────

interface StepPickerProps {
  stops: ColorStop[]
  value: ScaleStep
  onChange: (step: ScaleStep) => void
}

function StepPicker({ stops, value, onChange }: StepPickerProps) {
  return (
    <div className="stg-picker" role="radiogroup" aria-label="Select scale step">
      {stops.map(stop => (
        <button
          key={stop.step}
          className={`stg-picker__dot${stop.step === value ? ' stg-picker__dot--active' : ''}`}
          style={{ backgroundColor: stop.hex }}
          onClick={() => onChange(stop.step)}
          aria-label={`Step ${stop.step}: ${stop.hex}`}
          aria-pressed={stop.step === value}
          title={`${stop.step} · ${stop.hex}\n${stop.cssOklch}`}
        />
      ))}
    </div>
  )
}

// ─── Token cell ──────────────────────────────────────────────────────────────

interface TokenCellProps {
  hex: string
  cssOklch: string
  step: ScaleStep
  stops: ColorStop[]
  onStepChange: (step: ScaleStep) => void
}

function TokenCell({ hex, cssOklch, step, stops, onStepChange }: TokenCellProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(hex)
    } catch {
      const el = document.createElement('textarea')
      el.value = hex
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }, [hex])

  return (
    <div className="stg-cell">
      <button
        className="stg-cell__swatch"
        style={{ backgroundColor: hex }}
        onClick={handleCopy}
        title={cssOklch}
        aria-label={`${hex} — click to copy`}
      />
      <button className="stg-cell__hex" onClick={handleCopy} title="Click to copy">
        {copied ? 'copied!' : hex}
      </button>
      <span className="stg-cell__step">{step}</span>
      <StepPicker stops={stops} value={step} onChange={onStepChange} />
    </div>
  )
}

// ─── SemanticTokenGrid ───────────────────────────────────────────────────────

interface SemanticTokenGridProps {
  lightScale: TokenScale
  darkScale: TokenScale
}

export default function SemanticTokenGrid({ lightScale, darkScale }: SemanticTokenGridProps) {
  const [overrides, setOverrides] = useState<TokenOverrides>({ light: {}, dark: {} })

  const tokenMap = useMemo(
    () => mapToSemanticTokens(lightScale, darkScale, overrides),
    [lightScale, darkScale, overrides],
  )

  const handleOverride = useCallback(
    (name: SemanticToken, mode: 'light' | 'dark', step: ScaleStep) => {
      setOverrides(prev => ({
        ...prev,
        [mode]: { ...prev[mode], [name]: step },
      }))
    },
    [],
  )

  return (
    <section className="stg" aria-label="Semantic token mapping">
      <div className="stg-header">
        <div className="stg-col-token">Token</div>
        <div className="stg-col-mode">Light</div>
        <div className="stg-col-mode">Dark</div>
      </div>

      {SEMANTIC_TOKENS.map(name => {
        const light = tokenMap.light.find(t => t.name === name)!
        const dark  = tokenMap.dark.find(t => t.name === name)!
        return (
          <div key={name} className="stg-row">
            <div className="stg-col-token">
              <span className="stg-token-name">{name}</span>
              <span className="stg-token-desc">{light.description}</span>
            </div>
            <div className="stg-col-mode">
              <TokenCell
                hex={light.hex}
                cssOklch={light.cssOklch}
                step={light.step}
                stops={lightScale.stops}
                onStepChange={step => handleOverride(name, 'light', step)}
              />
            </div>
            <div className="stg-col-mode">
              <TokenCell
                hex={dark.hex}
                cssOklch={dark.cssOklch}
                step={dark.step}
                stops={darkScale.stops}
                onStepChange={step => handleOverride(name, 'dark', step)}
              />
            </div>
          </div>
        )
      })}
    </section>
  )
}
