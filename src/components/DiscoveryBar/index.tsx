import { useState, useCallback } from 'react'
import { PRESETS, type Preset } from '../../lib/presets'
import type { MultiSeeds } from '../../hooks/useMultiPalette'
import './DiscoveryBar.css'

interface DiscoveryBarProps {
  onApplyPreset: (seeds: MultiSeeds) => void
  onShuffle: () => void
}

export default function DiscoveryBar({ onApplyPreset, onShuffle }: DiscoveryBarProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    try { await navigator.clipboard.writeText(window.location.href) }
    catch {
      const el = document.createElement('input')
      el.value = window.location.href
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }, [])

  return (
    <div className="disc-bar" aria-label="Palette discovery">

      {/* ── Preset swatches ── */}
      <span className="disc-bar__label">Presets</span>
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
      </div>

      {/* ── Actions ── */}
      <div className="disc-bar__actions">
        <button
          className="disc-bar__btn"
          onClick={onShuffle}
          title="Random palette"
          aria-label="Shuffle to a random palette"
        >
          ↺ Shuffle
        </button>
        <button
          className="disc-bar__btn disc-bar__btn--share"
          onClick={handleShare}
          aria-live="polite"
          aria-label="Copy share link"
        >
          {copied ? '✓ Copied!' : '⤤ Share'}
        </button>
      </div>

    </div>
  )
}
