import { Fragment, useMemo, useState } from 'react'
import { buildContrastMatrix } from '../../lib/contrast'
import type { ContrastPair, ScaleStep, TokenScale } from '../../types'
import './ContrastMatrix.css'

// ─── Types & helpers ─────────────────────────────────────────────────────────

type PassLevel = 'AAA' | 'AA' | 'AALarge' | 'fail'
type FilterMode = 'all' | 'AA' | 'AAA' | 'fail'

const SCALE_STEPS: ScaleStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const LEVEL_CLASS: Record<PassLevel, string> = {
  AAA:     'aaa',
  AA:      'aa',
  AALarge: 'aalarge',
  fail:    'fail',
}

function passLevel(pair: ContrastPair): PassLevel {
  if (pair.passAAA)     return 'AAA'
  if (pair.passAA)      return 'AA'
  if (pair.passAALarge) return 'AALarge'
  return 'fail'
}

function matchesFilter(level: PassLevel, filter: FilterMode): boolean {
  if (filter === 'all')  return true
  if (filter === 'AA')   return level === 'AAA' || level === 'AA'
  if (filter === 'AAA')  return level === 'AAA'
  if (filter === 'fail') return level === 'fail'
  return true
}

// ─── ContrastMatrix ──────────────────────────────────────────────────────────

interface ContrastMatrixProps {
  lightScale: TokenScale
  darkScale: TokenScale
}

export default function ContrastMatrix({ lightScale, darkScale }: ContrastMatrixProps) {
  const [mode,   setMode]   = useState<'light' | 'dark'>('light')
  const [filter, setFilter] = useState<FilterMode>('all')

  const activeScale = mode === 'light' ? lightScale : darkScale

  const matrix = useMemo(
    () => buildContrastMatrix(activeScale.stops),
    [activeScale],
  )

  // Lookup map for O(1) cell access
  const lookup = useMemo(() => {
    const map = new Map<string, ContrastPair>()
    for (const pair of matrix) {
      map.set(`${pair.fgStep}-${pair.bgStep}`, pair)
    }
    return map
  }, [matrix])

  // Counts per filter mode for button labels
  const counts = useMemo(() => {
    let aa = 0, aaa = 0, fail = 0
    for (const pair of matrix) {
      const lv = passLevel(pair)
      if (lv === 'AAA' || lv === 'AA') aa++
      if (lv === 'AAA') aaa++
      if (lv === 'fail') fail++
    }
    return { all: matrix.length, AA: aa, AAA: aaa, fail }
  }, [matrix])

  // Step → actual hex for header swatches
  const stepToHex = useMemo(
    () => Object.fromEntries(activeScale.stops.map(s => [s.step, s.hex])) as Record<ScaleStep, string>,
    [activeScale],
  )

  const FILTERS: { id: FilterMode; label: string }[] = [
    { id: 'all',  label: `All (${counts.all})`  },
    { id: 'AA',   label: `AA+ (${counts.AA})`   },
    { id: 'AAA',  label: `AAA (${counts.AAA})`  },
    { id: 'fail', label: `Fail (${counts.fail})` },
  ]

  return (
    <section className="cm" aria-label="Contrast matrix">
      <div className="cm-header">
        <span className="cm-eyebrow">Contrast Matrix</span>
        <div className="cm-header__right">
          {/* Mode toggle */}
          <div className="cm-toggle" role="group" aria-label="Select scale mode">
            {(['light', 'dark'] as const).map(m => (
              <button
                key={m}
                className={`cm-toggle__btn${mode === m ? ' cm-toggle__btn--active' : ''}`}
                onClick={() => setMode(m)}
              >{m}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div className="cm-filters" role="group" aria-label="Filter by pass level">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            className={`cm-filter__btn cm-filter__btn--${id}${filter === id ? ' cm-filter__btn--active' : ''}`}
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
          >{label}</button>
        ))}
      </div>

      {/* Grid */}
      <div className="cm-scroll-wrapper">
        <div className="cm-grid" role="grid" aria-label="Foreground × background contrast pairs">
          {/* Column header row */}
          <div className="cm-corner" aria-hidden="true">
            <span>FG↓</span>
            <span>BG→</span>
          </div>
          {SCALE_STEPS.map(step => (
            <div key={`ch-${step}`} className="cm-col-header" aria-label={`Background step ${step}`}>
              <span
                className="cm-swatch-dot"
                style={{ backgroundColor: stepToHex[step] }}
                aria-hidden="true"
              />
              {step}
            </div>
          ))}

          {/* Data rows */}
          {SCALE_STEPS.map(fgStep => (
            <Fragment key={fgStep}>
              <div className="cm-row-header" aria-label={`Foreground step ${fgStep}`}>
                <span
                  className="cm-swatch-dot"
                  style={{ backgroundColor: stepToHex[fgStep] }}
                  aria-hidden="true"
                />
                {fgStep}
              </div>
              {SCALE_STEPS.map(bgStep => {
                if (fgStep === bgStep) {
                  return (
                    <div
                      key={`${fgStep}-${bgStep}`}
                      className="cm-cell cm-cell--same"
                      aria-hidden="true"
                    />
                  )
                }
                const pair = lookup.get(`${fgStep}-${bgStep}`)
                if (!pair) return <div key={`${fgStep}-${bgStep}`} className="cm-cell cm-cell--fail" />
                const lv = passLevel(pair)
                const dim = !matchesFilter(lv, filter)
                return (
                  <div
                    key={`${fgStep}-${bgStep}`}
                    className={`cm-cell cm-cell--${LEVEL_CLASS[lv]}${dim ? ' cm-cell--dim' : ''}`}
                    title={`${fgStep} on ${bgStep} · ${pair.ratio}:1 · ${lv === 'AALarge' ? 'AA Large' : lv}`}
                    aria-label={`Step ${fgStep} on step ${bgStep}: ${pair.ratio} to 1, ${lv}`}
                  >
                    <span className="cm-cell__ratio" aria-hidden="true">{pair.ratio}</span>
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="cm-legend" aria-label="Pass level legend">
        {[
          { cls: 'aaa',     label: 'AAA ≥ 7:1'  },
          { cls: 'aa',      label: 'AA ≥ 4.5:1'  },
          { cls: 'aalarge', label: 'AA Large ≥ 3:1' },
          { cls: 'fail',    label: 'Fail'         },
        ].map(({ cls, label }) => (
          <div key={cls} className="cm-legend__item">
            <div className={`cm-legend__swatch cm-cell--${cls}`} aria-hidden="true" />
            <span className="cm-legend__label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
