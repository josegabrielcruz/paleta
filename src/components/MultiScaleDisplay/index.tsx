import PaletteScale from '../PaletteScale'
import type { UseMultiPaletteResult } from '../../hooks/useMultiPalette'
import './MultiScaleDisplay.css'

interface MultiScaleDisplayProps {
  multiPalette: UseMultiPaletteResult
}

const ROWS: { key: keyof UseMultiPaletteResult; label: string }[] = [
  { key: 'primary',   label: 'Primary'   },
  { key: 'secondary', label: 'Secondary' },
  { key: 'neutral',   label: 'Neutral'   },
]

export default function MultiScaleDisplay({ multiPalette }: MultiScaleDisplayProps) {
  return (
    <section className="msd" aria-label="All scales">
      <div className="msd-header">
        <span className="msd-eyebrow">All Scales</span>
        <div className="msd-header__line" aria-hidden="true" />
      </div>
      <div className="msd-tracks">
        {ROWS.map(({ key, label }) => (
          <div key={key} className="msd-track">
            <span className="msd-track-label">{label}</span>
            <PaletteScale scale={multiPalette[key].lightScale} />
          </div>
        ))}
      </div>
    </section>
  )
}
