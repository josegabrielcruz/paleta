import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { Theme } from '../../hooks/useTheme'
import './ThemeToggle.css'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const prefersReduced = useReducedMotion()

  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: prefersReduced ? 0 : -50, scale: prefersReduced ? 1 : 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: prefersReduced ? 0 : 50, scale: prefersReduced ? 1 : 0.5 }}
          transition={{ duration: prefersReduced ? 0 : 0.22, ease: EASE }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="1"    x2="8"    y2="2.75"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="13.25" x2="8"  y2="15"    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1"    y1="8"  x2="2.75"  y2="8"   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13.25" y1="8" x2="15"   y2="8"    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3.17" y1="3.17" x2="4.41" y2="4.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.59" y1="11.59" x2="12.83" y2="12.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3.17" y1="12.83" x2="4.41" y2="11.59" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.59" y1="4.41" x2="12.83" y2="3.17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 9.5A6 6 0 1 1 6.5 2.5a4.5 4.5 0 0 0 7 7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
