import { motion, useReducedMotion } from 'framer-motion'
import { useActiveSection } from '../../hooks/useActiveSection'
import './SectionNav.css'

export const SECTION_NAV_ITEMS = [
  { id: 'section-scales',    label: 'Scales'    },
  { id: 'section-tokens',    label: 'Tokens'    },
  { id: 'section-contrast',  label: 'Contrast'  },
  { id: 'section-preview',   label: 'Preview'   },
  { id: 'section-export',    label: 'Export'    },
  { id: 'section-gradients', label: 'Gradients' },
] as const

interface SectionNavProps {
  visible: boolean
}

export function SectionNav({ visible }: SectionNavProps) {
  const activeId = useActiveSection(SECTION_NAV_ITEMS.map(s => s.id))
  const prefersReduced = useReducedMotion()

  if (!visible) return null

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="section-nav" aria-label="Jump to section">
      <div className="section-nav__track">
        {/* Vertical line connecting dot centers */}
        <div className="section-nav__line" aria-hidden="true" />

        {SECTION_NAV_ITEMS.map(s => (
          <button
            key={s.id}
            className={`section-nav__item${activeId === s.id ? ' section-nav__item--active' : ''}`}
            onClick={() => scrollTo(s.id)}
            aria-label={`Jump to ${s.label}`}
            title={s.label}
          >
            {/* Ring indicator travels between slots via layoutId spring */}
            <div className="section-nav__dot-slot">
              {activeId === s.id && (
                <motion.span
                  layoutId="nav-ring"
                  className="section-nav__ring"
                  aria-hidden="true"
                  transition={
                    prefersReduced
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 32 }
                  }
                />
              )}
              <span className="section-nav__dot" aria-hidden="true" />
            </div>
            <span className="section-nav__label">{s.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
