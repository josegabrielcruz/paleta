import { SIMULATIONS, type SimulationType } from '../../lib/simulate'
import './SimulationBar.css'

interface SimulationBarProps {
  active: SimulationType
  onChange: (type: SimulationType) => void
}

export default function SimulationBar({ active, onChange }: SimulationBarProps) {
  return (
    <div className="sim-bar" role="group" aria-label="Color vision simulation">
      <span className="sim-bar__eyebrow">Simulate</span>
      <div className="sim-bar__buttons">
        {SIMULATIONS.map(s => (
          <button
            key={s.id}
            className={`sim-bar__btn${active === s.id ? ' sim-bar__btn--active' : ''}`}
            onClick={() => onChange(s.id)}
            aria-pressed={active === s.id}
            title={s.description}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
