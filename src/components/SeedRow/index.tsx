import { getSecondarySuggestions } from '../../lib/harmony'
import { SeedColorInput } from '../SeedColorInput'
import './SeedRow.css'

interface SeedRowProps {
  primarySeed:   string
  secondarySeed: string
  neutralSeed:   string
  onPrimaryChange:   (hex: string) => void
  onSecondaryChange: (hex: string) => void
  onNeutralChange:   (hex: string) => void
}

export default function SeedRow({
  primarySeed,
  secondarySeed,
  neutralSeed,
  onPrimaryChange,
  onSecondaryChange,
  onNeutralChange,
}: SeedRowProps) {
  const suggestions = getSecondarySuggestions(primarySeed)

  return (
    <div className="seed-row" role="group" aria-label="Seed colors">

      {/* Primary */}
      <div className="seed-row__col">
        <span className="seed-row__label">Primary</span>
        <SeedColorInput value={primarySeed} onChange={onPrimaryChange} />
      </div>

      {/* Secondary — includes harmony suggestion chips */}
      <div className="seed-row__col">
        <span className="seed-row__label">Secondary</span>
        <SeedColorInput value={secondarySeed} onChange={onSecondaryChange} />
        <div className="seed-row__chips" aria-label="Harmony suggestions from primary">
          {suggestions.map(s => (
            <button
              key={s.label}
              className="seed-row__chip"
              onClick={() => onSecondaryChange(s.hex)}
              title={`${s.label}: ${s.hex}`}
              aria-label={`Apply ${s.label} harmony`}
            >
              <span className="seed-row__chip-dot" style={{ backgroundColor: s.hex }} aria-hidden="true" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Neutral */}
      <div className="seed-row__col">
        <span className="seed-row__label">Neutral</span>
        <SeedColorInput value={neutralSeed} onChange={onNeutralChange} />
      </div>

    </div>
  )
}
