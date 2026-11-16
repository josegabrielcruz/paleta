import { useState, useCallback } from 'react'
import { ThemeToggle } from '../ThemeToggle'
import { PaletaLogo } from '../../assets/PaletaLogo'
import type { Theme } from '../../hooks/useTheme'
import ShareIcon from '@iconify-react/bxs/share'
import CheckmarkFillIcon from '@iconify-react/eva/checkmark-fill'
import './PaletteHeader.css'

interface PaletteHeaderProps {
  theme: Theme
  onToggleTheme: () => void
}

export function PaletteHeader({ theme, onToggleTheme }: PaletteHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    try { await navigator.clipboard.writeText(window.location.href) }
    catch { /* silent fallback */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }, [])

  return (
    <header className="paleta-header" role="banner">
      <div className="paleta-header__inner">
        <div className="paleta-header__brand">
          <PaletaLogo height={40} aria-hidden={true} />
          <span className="paleta-header__wordmark">Paleta</span>
        </div>
        <div className="paleta-header__actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            className="paleta-header__share"
            onClick={handleShare}
            aria-live="polite"
            aria-label="Copy share link"
          >
            {copied ? <><CheckmarkFillIcon height="16" />&nbsp;Copied</> : <><ShareIcon height="16" />&nbsp;Share</>}
          </button>
        </div>
      </div>
    </header>
  )
}
