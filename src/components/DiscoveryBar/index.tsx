import { PRESETS, type Preset } from '../../lib/presets'
import type { MultiSeeds } from '../../hooks/useMultiPalette'
import type { HistoryEntry } from '../../hooks/usePaletteHistory'
import Random1diceIcon from '@iconify-react/fad/random-1dice';
import './DiscoveryBar.css'

interface DiscoveryBarProps {
  onApplyPreset: (seeds: MultiSeeds) => void
  onShuffle: () => void
  history?: HistoryEntry[]
  onClearHistory?: () => void
}

export default function DiscoveryBar({ onApplyPreset, onShuffle, history, onClearHistory }: DiscoveryBarProps) {

  return (
    <div className="disc-bar" aria-label="Palette discovery">

      {/* ── Recent palettes ── */}
      {history && history.length > 0 && (
        <div className="disc-bar__recent-row">
          <span className="disc-bar__label disc-bar__label--history">Recent</span>
          <div className="disc-bar__presets" role="list">
            {history.map(entry => (
              <button
                key={entry.id}
                role="listitem"
                className="disc-bar__preset disc-bar__preset--history"
                onClick={() => onApplyPreset(entry.seeds)}
                title={`${entry.seeds.primary} · ${entry.seeds.secondary} · ${entry.seeds.neutral}`}
                aria-label={`Restore palette ${entry.seeds.primary}`}
              >
                <span className="disc-bar__dot" style={{ backgroundColor: entry.seeds.primary }}  aria-hidden="true" />
                <span className="disc-bar__dot" style={{ backgroundColor: entry.seeds.secondary }} aria-hidden="true" />
                <span className="disc-bar__dot" style={{ backgroundColor: entry.seeds.neutral }}   aria-hidden="true" />
              </button>
            ))}
            {onClearHistory && (
            <button className="disc-bar__clear" onClick={onClearHistory} aria-label="Clear palette history">
              Clear
            </button>
          )}
          </div>
        </div>
      )}

      {/* ── Preset swatches ── */}
      <p className={`disc-bar__label ${history && history.length ? 'has-history' : ''}`}>Presets</p>
      <div className="disc-bar__presets" role="list">
        {PRESETS.map((p: Preset) => (
          <button
            key={p.name}
            role="listitem"
            className="disc-bar__preset"
            onClick={() => onApplyPreset(p)}
            title={p.name}
            aria-label={`Apply ${p.name} preset`}
          >
            <span className="disc-bar__dot" style={{ backgroundColor: p.primary }}  aria-hidden="true" />
            <span className="disc-bar__dot" style={{ backgroundColor: p.secondary }} aria-hidden="true" />
            <span className="disc-bar__dot" style={{ backgroundColor: p.neutral }}   aria-hidden="true" />
          </button>
        ))}
        <button
          className="disc-bar__btn"
          onClick={onShuffle}
          title="Random palette"
          aria-label="Shuffle to a random palette"
        >
          <Random1diceIcon height="2.5em" /> Shuffle
        </button>
      </div>

      {/* ── Actions ── */}
      {/* <div className="disc-bar__actions">
        <button
          className="disc-bar__btn"
          onClick={onShuffle}
          title="Random palette"
          aria-label="Shuffle to a random palette"
        >
          <Random1diceIcon height="2.5em" /> Shuffle
        </button>
        <button
          className="disc-bar__btn disc-bar__btn--share"
          onClick={handleShare}
          aria-live="polite"
          aria-label="Copy share link"
        >
          {copied ? <><CheckmarkFillIcon height="16" />&nbsp;Copied</> : <><ShareIcon height="16" />&nbsp;Share</>}
        </button>
      </div> */}

    </div>
  )
}
