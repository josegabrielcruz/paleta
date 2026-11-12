import { useActiveSection } from '../../hooks/useActiveSection'
import './SectionNav.css'

export const SECTION_NAV_ITEMS = [
  { id: 'section-scales',   label: 'Scales'   },
  { id: 'section-tokens',   label: 'Tokens'   },
  { id: 'section-contrast', label: 'Contrast' },
  { id: 'section-preview',  label: 'Preview'  },
  { id: 'section-export',   label: 'Export'   },
] as const

interface SectionNavProps {
  visible: boolean
}

export function SectionNav({ visible }: SectionNavProps) {
  const activeId = useActiveSection(SECTION_NAV_ITEMS.map(s => s.id))

  if (!visible) return null

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="section-nav" aria-label="Jump to section">
      {SECTION_NAV_ITEMS.map(s => (
        <button
          key={s.id}
          className={`section-nav__item${activeId === s.id ? ' section-nav__item--active' : ''}`}
          onClick={() => scrollTo(s.id)}
          aria-label={`Jump to ${s.label}`}
          title={s.label}
        >
          <span className="section-nav__dot" aria-hidden="true" />
          <span className="section-nav__label">{s.label}</span>
        </button>
      ))}
    </nav>
  )
}
