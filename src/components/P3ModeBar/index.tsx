import './P3ModeBar.css'

interface P3ModeBarProps {
  active: boolean
  onChange: (active: boolean) => void
}

export function P3ModeBar({ active, onChange }: P3ModeBarProps) {
  return (
    <div className="p3-bar" aria-label="Display-P3 gamut mode">
      <span className="p3-bar__label">Display-P3</span>
      <div>
        <button
          className={`p3-bar__btn${active ? ' p3-bar__btn--active' : ''}`}
          onClick={() => onChange(!active)}
          aria-pressed={active}
          title="Expand palette beyond sRGB gamut — richer colors on P3 displays"
        >
          {active ? 'P3 on' : 'P3 off'}
        </button>
        {active && (
          <span className="p3-bar__hint">
            Wider gamut on P3 displays · sRGB hex used as fallback
          </span>
        )}
      </div>
    </div>
  )
}
