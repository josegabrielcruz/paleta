import type { TokenScale, ColorStop, ScaleStep } from '../../types'
import './ThemePreview.css'

function pick(stops: ColorStop[], step: ScaleStep): string {
  return stops.find(s => s.step === step)?.hex ?? '#888'
}

interface ThemePaneProps {
  scale: TokenScale
  mode: 'light' | 'dark'
}

function ThemePane({ scale, mode }: ThemePaneProps) {
  const s = scale.stops

  const tokens = mode === 'light'
    ? {
        '--tp-bg':               pick(s, 50),
        '--tp-surface':          pick(s, 100),
        '--tp-surface-2':        pick(s, 200),
        '--tp-border':           pick(s, 200),
        '--tp-border-strong':    pick(s, 300),
        '--tp-text':             pick(s, 900),
        '--tp-text-muted':       pick(s, 600),
        '--tp-brand':            pick(s, 600),
        '--tp-brand-hover':      pick(s, 700),
        '--tp-brand-fg':         pick(s, 50),
        '--tp-nav-active-bg':    pick(s, 200),
        '--tp-nav-active-text':  pick(s, 800),
      }
    : {
        '--tp-bg':               pick(s, 50),
        '--tp-surface':          pick(s, 100),
        '--tp-surface-2':        pick(s, 200),
        '--tp-border':           pick(s, 300),
        '--tp-border-strong':    pick(s, 400),
        '--tp-text':             pick(s, 950),
        '--tp-text-muted':       pick(s, 700),
        '--tp-brand':            pick(s, 700),
        '--tp-brand-hover':      pick(s, 600),
        '--tp-brand-fg':         pick(s, 50),
        '--tp-nav-active-bg':    pick(s, 200),
        '--tp-nav-active-text':  pick(s, 900),
      }

  return (
    <div
      className={`tp-pane tp-pane--${mode}`}
      style={tokens as React.CSSProperties}
    >
      <div className="tp-mode-label" aria-label={`${mode} mode preview`}>
        {mode}
      </div>
      <div className="tp-shell">
        <nav className="tp-nav" aria-label="Preview navigation">
          <div className="tp-nav-logo" aria-hidden="true" />
          {(['Overview', 'Tokens', 'Export'] as const).map((label, i) => (
            <div key={label} className={`tp-nav-item${i === 0 ? ' tp-nav-item--active' : ''}`}>
              <span className="tp-nav-dot" aria-hidden="true" />
              {label}
            </div>
          ))}
        </nav>

        <div className="tp-main">
          <div className="tp-card">
            <div className="tp-card-title">Color tokens</div>
            <div className="tp-card-body">
              Map your palette to semantic roles used across components.
            </div>
            <div className="tp-card-actions">
              <button className="tp-btn tp-btn--brand" tabIndex={-1}>Apply tokens</button>
              <button className="tp-btn tp-btn--ghost" tabIndex={-1}>Preview</button>
            </div>
          </div>

          <div className="tp-stat-row" aria-hidden="true">
            {['Primary', 'Surface', 'Border'].map(label => (
              <div key={label} className="tp-stat">
                <div className="tp-stat-label">{label}</div>
                <div className="tp-stat-bar">
                  <div className="tp-stat-fill" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ThemePreviewProps {
  lightScale: TokenScale
  darkScale: TokenScale
}

export default function ThemePreview({ lightScale, darkScale }: ThemePreviewProps) {
  return (
    <section className="theme-preview" aria-label="Theme preview">
      <div className="theme-preview__header">
        <span className="theme-preview__eyebrow">Preview</span>
      </div>
      <div className="theme-preview__panes">
        <ThemePane scale={lightScale} mode="light" />
        <ThemePane scale={darkScale} mode="dark" />
      </div>
    </section>
  )
}
