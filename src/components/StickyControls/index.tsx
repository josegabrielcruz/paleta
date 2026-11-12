import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { MultiSeeds } from '../../hooks/useMultiPalette'
import './StickyControls.css'

interface StickyControlsProps {
  seeds: MultiSeeds
  visible: boolean
  onShuffle: () => void
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function StickyControls({ seeds, visible, onShuffle }: StickyControlsProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    try { await navigator.clipboard.writeText(window.location.href) }
    catch { /* silent fallback */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [])

  const scrollToControls = () => {
    document.getElementById('section-controls')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const seeds3 = [
    { hex: seeds.primary,   label: 'Primary'   },
    { hex: seeds.secondary, label: 'Secondary' },
    { hex: seeds.neutral,   label: 'Neutral'   },
  ]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="sticky-ctrl"
          role="banner"
          aria-label="Sticky palette controls"
          initial={{ y: -52, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -52, opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          {/* Seed swatches — click scrolls back to seed pickers */}
          <button
            className="sticky-ctrl__seeds"
            onClick={scrollToControls}
            title="Scroll to seed pickers"
            aria-label="Edit seed colors"
          >
            {seeds3.map(s => (
              <span key={s.label} className="sticky-ctrl__seed">
                <span className="sticky-ctrl__dot" style={{ backgroundColor: s.hex }} aria-hidden="true" />
                <span className="sticky-ctrl__hex">{s.hex}</span>
              </span>
            ))}
          </button>

          {/* Actions */}
          <div className="sticky-ctrl__actions">
            <button className="sticky-ctrl__btn" onClick={onShuffle} title="Random palette" aria-label="Shuffle palette">
              ↺
            </button>
            <button className="sticky-ctrl__btn" onClick={handleShare} aria-live="polite" aria-label="Copy share link">
              {copied ? '✓' : '⤤'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
