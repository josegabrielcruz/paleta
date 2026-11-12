import { useMemo, useState } from 'react'
import { mapToSemanticTokens, mapToMixedSemanticTokens, type ResolvedToken, type SemanticToken } from '../../lib/tokens'
import type { TokenScale } from '../../types'
import type { UseMultiPaletteResult } from '../../hooks/useMultiPalette'
import './ComponentPreview.css'

function get(tokens: ResolvedToken[], name: SemanticToken): string {
  return tokens.find(t => t.name === name)?.hex ?? '#888'
}

function buildCssVars(tokens: ResolvedToken[]) {
  return {
    '--cp-bg':          get(tokens, 'background'),
    '--cp-surface':     get(tokens, 'surface'),
    '--cp-border':      get(tokens, 'border'),
    '--cp-text':        get(tokens, 'text-primary'),
    '--cp-text-muted':  get(tokens, 'text-secondary'),
    '--cp-brand':       get(tokens, 'primary'),
    '--cp-brand-hover': get(tokens, 'primary-hover'),
    '--cp-brand-fg':    get(tokens, 'background'),
    '--cp-muted':       get(tokens, 'muted'),
    '--cp-accent':      get(tokens, 'accent'),
  }
}

interface ComponentPreviewProps {
  lightScale: TokenScale
  darkScale: TokenScale
  multiPalette?: UseMultiPaletteResult
}

type PaletteSlot = 'primary' | 'secondary' | 'neutral' | 'system'
type PreviewMode = 'light' | 'dark' | 'both'

// ─── Pane content (extracted so it can be rendered once or twice) ─────────────

interface PaneProps {
  tokens: ResolvedToken[]
  paneMode: 'light' | 'dark'
  showLabel?: boolean
}

function Pane({ tokens, paneMode, showLabel }: PaneProps) {
  const cssVars = buildCssVars(tokens)
  return (
    <div className={`cp-pane cp-pane--${paneMode}`} style={cssVars as React.CSSProperties}>
      {showLabel && <div className="cp-pane-label">{paneMode}</div>}

      {/* 1 — Buttons */}
      <div className="cp-section">
        <div className="cp-section-label">Buttons</div>
        <div className="cp-row cp-row--wrap">
          <button className="cp-btn cp-btn--filled" tabIndex={-1}>Primary</button>
          <button className="cp-btn cp-btn--outline" tabIndex={-1}>Outline</button>
          <button className="cp-btn cp-btn--ghost" tabIndex={-1}>Ghost</button>
          <button className="cp-btn cp-btn--filled" disabled tabIndex={-1}>Disabled</button>
        </div>
      </div>

      {/* 2 — Badges */}
      <div className="cp-section">
        <div className="cp-section-label">Badges</div>
        <div className="cp-row cp-row--wrap">
          <span className="cp-badge cp-badge--filled">brand</span>
          <span className="cp-badge cp-badge--outline">outline</span>
          <span className="cp-badge cp-badge--muted">muted</span>
          <span className="cp-badge cp-badge--accent">accent</span>
        </div>
      </div>

      {/* 3 — Card */}
      <div className="cp-section">
        <div className="cp-section-label">Card</div>
        <div className="cp-card">
          <div className="cp-card__header">
            <span className="cp-card__title">Design token system</span>
            <span className="cp-badge cp-badge--filled">new</span>
          </div>
          <p className="cp-card__body">
            Generate contrast-safe, perceptually uniform palettes from a
            single seed color. Export as CSS, Tailwind, or Figma tokens.
          </p>
          <div className="cp-card__actions">
            <button className="cp-btn cp-btn--filled cp-btn--sm" tabIndex={-1}>Get started</button>
            <button className="cp-btn cp-btn--ghost cp-btn--sm" tabIndex={-1}>Learn more</button>
          </div>
        </div>
      </div>

      {/* 4 — Form */}
      <div className="cp-section">
        <div className="cp-section-label">Form</div>
        <div className="cp-form">
          <div className="cp-field">
            <label className="cp-label">Email address</label>
            <input className="cp-input" type="email" placeholder="you@company.com" readOnly tabIndex={-1} aria-label="Default input example" />
            <span className="cp-hint">We'll never share your email.</span>
          </div>
          <div className="cp-field">
            <label className="cp-label">Full name</label>
            <input className="cp-input cp-input--focused" type="text" defaultValue="Jordan Lee" readOnly tabIndex={-1} aria-label="Focused input example" />
          </div>
          <div className="cp-field">
            <label className="cp-label cp-label--error">Password</label>
            <input className="cp-input cp-input--error" type="text" defaultValue="hunter2" readOnly tabIndex={-1} aria-invalid="true" aria-label="Error input example" />
            <span className="cp-error-msg">Must be at least 8 characters.</span>
          </div>
        </div>
      </div>

      {/* 5 — Alerts */}
      <div className="cp-section">
        <div className="cp-section-label">Alerts</div>
        <div className="cp-alerts">
          <div className="cp-alert cp-alert--info" role="alert">
            <span className="cp-alert__icon" aria-hidden="true">ⓘ</span>
            <div className="cp-alert__content">
              <strong className="cp-alert__title">Info</strong>
              <span className="cp-alert__msg">Palette generated from seed color. 11 stops computed.</span>
            </div>
          </div>
          <div className="cp-alert cp-alert--neutral" role="alert">
            <span className="cp-alert__icon" aria-hidden="true">◎</span>
            <div className="cp-alert__content">
              <strong className="cp-alert__title">Neutral</strong>
              <span className="cp-alert__msg">This action requires confirmation before proceeding.</span>
            </div>
          </div>
          <div className="cp-alert cp-alert--error" role="alert">
            <span className="cp-alert__icon" aria-hidden="true">⚠</span>
            <div className="cp-alert__content">
              <strong className="cp-alert__title">Error</strong>
              <span className="cp-alert__msg">Unable to save changes. Check your connection.</span>
            </div>
          </div>
          <div className="cp-alert cp-alert--placeholder" aria-label="Coming in Phase 7: success and warning variants">
            <span className="cp-alert__icon" aria-hidden="true">…</span>
            <div className="cp-alert__content">
              <strong className="cp-alert__title">Success / Warning</strong>
              <span className="cp-alert__msg">Multi-seed palette — Phase 7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ComponentPreview ─────────────────────────────────────────────────────────

export default function ComponentPreview({ lightScale, darkScale, multiPalette }: ComponentPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>('light')
  const [slot, setSlot] = useState<PaletteSlot>('primary')

  const activeLight = multiPalette ? multiPalette[slot === 'system' ? 'primary' : slot].lightScale : lightScale
  const activeDark  = multiPalette ? multiPalette[slot === 'system' ? 'primary' : slot].darkScale  : darkScale

  // 'system' mode mixes tokens from all three scales; all other modes use a single scale pair
  const tokenMap = useMemo(() => {
    if (slot === 'system' && multiPalette) {
      return mapToMixedSemanticTokens(
        multiPalette.neutral.lightScale,   multiPalette.neutral.darkScale,
        multiPalette.primary.lightScale,   multiPalette.primary.darkScale,
        multiPalette.secondary.lightScale, multiPalette.secondary.darkScale,
      )
    }
    return mapToSemanticTokens(activeLight, activeDark)
  }, [slot, multiPalette, activeLight, activeDark])

  return (
    <section className="cp" aria-label="Component preview">
      <div className="cp-header">
        <span className="cp-eyebrow">Component Preview</span>
        <div className="cp-header__line" aria-hidden="true" />
        {multiPalette && (
          <div className="cp-toggle" role="group" aria-label="Select palette">
            {(['primary', 'secondary', 'neutral', 'system'] as const).map(s => (
              <button key={s} className={`cp-toggle__btn${slot === s ? ' cp-toggle__btn--active' : ''}${s === 'system' ? ' cp-toggle__btn--system' : ''}`} onClick={() => setSlot(s)} aria-pressed={slot === s} title={s === 'system' ? 'Neutral surfaces + Primary brand + Secondary accent' : undefined}>{s}</button>
            ))}
          </div>
        )}
        <div className="cp-toggle" role="group" aria-label="Select preview mode">
          {(['light', 'dark', 'both'] as const).map(m => (
            <button key={m} className={`cp-toggle__btn${mode === m ? ' cp-toggle__btn--active' : ''}`} onClick={() => setMode(m)} aria-pressed={mode === m}>{m}</button>
          ))}
        </div>
      </div>

      {mode === 'both' ? (
        <div className="cp-both">
          <Pane tokens={tokenMap.light} paneMode="light" showLabel />
          <Pane tokens={tokenMap.dark}  paneMode="dark"  showLabel />
        </div>
      ) : (
        <Pane tokens={mode === 'light' ? tokenMap.light : tokenMap.dark} paneMode={mode} />
      )}
    </section>
  )
}
