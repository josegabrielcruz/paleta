import { forwardRef } from 'react'
import { PaletaLogo } from '../../assets/PaletaLogo'
import type { AISuggestion } from '../../hooks/useAISuggest'
import FlameFillRoundIcon from '@iconify-react/coolicons/flame-fill-round';
import './PaletteCard.css'

interface PaletteCardProps {
  description: string
  suggestion: AISuggestion
}

const SWATCH_KEYS = ['primary', 'secondary', 'neutral'] as const

// forwardRef lets the parent pass a ref for html2canvas capture
export const PaletteCard = forwardRef<HTMLDivElement, PaletteCardProps>(
  ({ description, suggestion }, ref) => {
    const { seeds, strategy, reasoning } = suggestion

    return (
      <div ref={ref} className="palette-card">
        <div className="palette-card__header">
          <PaletaLogo height={32} aria-hidden={true} />
          <span className="palette-card__brand">Paleta</span>
        </div>

        <div className="palette-card__body">
          <blockquote className="palette-card__description">
            &ldquo;{description}&rdquo;
          </blockquote>
          <p className="palette-card__strategy">{strategy}</p>
        </div>

        <div className="palette-card__swatches">
          {SWATCH_KEYS.map(key => (
            <div key={key} className="palette-card__swatch-col">
              <div
                className="palette-card__swatch"
                style={{ backgroundColor: seeds[key] }}
              />
              <span className="palette-card__swatch-label">{key}</span>
              <span className="palette-card__swatch-hex">{seeds[key]}</span>
              {reasoning[key] && (
                <span className="palette-card__swatch-reason">{reasoning[key]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="palette-card__footer">
          <span className="palette-card__attribution">Generated with paleta <FlameFillRoundIcon height="18px" /></span>
          <span className="palette-card__url">{window.location.hostname}</span>
        </div>
      </div>
    )
  }
)

PaletteCard.displayName = 'PaletteCard'
