import { useState, useEffect } from 'react'

/**
 * Returns the id of the section the user is currently scrolled into.
 * Uses a scroll-position calculation that works correctly in both directions.
 * Falls back to the last section id when near the bottom of the page.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (!ids.length) return

    const calculate = () => {
      // Near-bottom edge case: last section can never reach the detection line
      const distanceFromBottom =
        document.documentElement.scrollHeight - window.scrollY - window.innerHeight
      if (distanceFromBottom < 80) {
        setActiveId(ids[ids.length - 1])
        return
      }

      // Detection line: 35% from the top of the viewport
      const detectionY = window.scrollY + window.innerHeight * 0.35

      // Walk sections bottom-to-top, return first one whose top is at or above the line
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (!el) continue
        const top = el.getBoundingClientRect().top + window.scrollY
        if (top <= detectionY) {
          setActiveId(ids[i])
          return
        }
      }
    }

    window.addEventListener('scroll', calculate, { passive: true })
    calculate()

    return () => window.removeEventListener('scroll', calculate)
  }, [ids.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  return activeId
}
