import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useAISuggest } from '../../hooks/useAISuggest'
import type { MultiSeeds } from '../../hooks/useMultiPalette'
import './BrandInput.css'

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

const PLACEHOLDER_EXAMPLES = [
  'B2B SaaS for finance teams. Professional, trustworthy, modern.',
  'Consumer fitness app. Energetic, motivating, not intimidating.',
  'Developer tooling. Dark mode first. Think Linear, not Jira.',
  'Luxury e-commerce. Minimal, editorial, high-contrast.',
]

interface BrandInputProps {
  onApply: (seeds: MultiSeeds) => void
}

export function BrandInput({ onApply }: BrandInputProps) {
  const [description, setDescription] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const lastDescriptionRef = useRef('')

  const {
    status,
    suggestion,
    partialSeeds,
    error,
    generate,
    reset,
  } = useAISuggest()

  const prefersReduced = useReducedMotion()
  const isActive = status === 'loading' || status === 'streaming'
  const showResults = status === 'streaming' || status === 'done'

  // Rotate placeholder text while idle and not focused
  useEffect(() => {
    if (isFocused || status !== 'idle') return
    const id = setInterval(
      () => setPlaceholderIdx(i => (i + 1) % PLACEHOLDER_EXAMPLES.length),
      3200,
    )
    return () => clearInterval(id)
  }, [isFocused, status])

  const handleGenerate = useCallback(() => {
    const trimmed = description.trim()
    if (!trimmed || isActive) return
    lastDescriptionRef.current = trimmed
    generate(trimmed)
  }, [description, isActive, generate])

  const handleApply = useCallback(() => {
    if (suggestion) onApply(suggestion.seeds)
  }, [suggestion, onApply])

  const handleRegenerate = useCallback(() => {
    generate(lastDescriptionRef.current)
  }, [generate])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
    },
    [handleGenerate],
  )

  const colorRows = [
    {
      key: 'primary',
      label: 'Primary',
      hex: partialSeeds.primary ?? suggestion?.seeds.primary,
      reasoning: suggestion?.reasoning.primary,
    },
    {
      key: 'secondary',
      label: 'Secondary',
      hex: partialSeeds.secondary ?? suggestion?.seeds.secondary,
      reasoning: suggestion?.reasoning.secondary,
    },
    {
      key: 'neutral',
      label: 'Neutral',
      hex: partialSeeds.neutral ?? suggestion?.seeds.neutral,
      reasoning: suggestion?.reasoning.neutral,
    },
  ]

  const resultsVariants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT_EXPO } },
    exit:    { opacity: 0,         transition: { duration: 0.15 } },
  }

  return (
    <div className="brand-input" aria-label="AI palette generator">

      {/* ── Input form ── */}
      <div className={`brand-input__form${isActive ? ' brand-input__form--active' : ''}`}>
        <textarea
          className="brand-input__textarea"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER_EXAMPLES[placeholderIdx]}
          disabled={isActive}
          rows={2}
          maxLength={500}
          aria-label="Brand or product description"
        />
        <div className="brand-input__form-footer">
          <span className="brand-input__hint">⌘↵ to generate</span>
          <button
            className={`brand-input__generate${isActive ? ' brand-input__generate--loading' : ''}`}
            onClick={handleGenerate}
            disabled={!description.trim() || isActive}
            aria-label="Generate palette"
          >
            {isActive
              ? <span className="brand-input__spinner" aria-hidden="true" />
              : 'Generate ✦'}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {status === 'error' && (
        <div className="brand-input__error" role="alert">
          <span className="brand-input__error-msg">{error ?? 'Something went wrong.'}</span>
          <button className="brand-input__error-dismiss" onClick={reset}>Dismiss</button>
        </div>
      )}

      {/* ── Results panel ── */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            className="brand-input__results"
            variants={resultsVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Strategy text */}
            <p className="brand-input__strategy">
              {status === 'done' && suggestion
                ? suggestion.strategy
                : <span className="brand-input__thinking">Generating palette…</span>}
            </p>

            {/* Color rows */}
            <div className="brand-input__seed-rows" role="list">
              {colorRows.map(({ key, label, hex, reasoning }) => (
                <div key={key} className="brand-input__seed-row" role="listitem">
                  <span
                    className={`brand-input__seed-dot${!hex ? ' brand-input__seed-dot--pending' : ''}`}
                    style={hex ? { backgroundColor: hex } : undefined}
                    aria-hidden="true"
                  />
                  <span className="brand-input__seed-label">{label}</span>
                  <span className="brand-input__seed-hex">{hex ?? '—'}</span>
                  <span
                    className={`brand-input__seed-chip${!hex ? ' brand-input__seed-chip--pending' : ''}`}
                    style={hex ? { backgroundColor: hex } : undefined}
                    aria-hidden="true"
                  />
                  <span className="brand-input__seed-reasoning">{reasoning ?? ''}</span>
                </div>
              ))}
            </div>

            {/* Apply / Regenerate */}
            {status === 'done' && (
              <div className="brand-input__result-actions">
                <button className="brand-input__apply" onClick={handleApply}>
                  Apply these colors
                </button>
                <button className="brand-input__regen" onClick={handleRegenerate}>
                  Regenerate
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
