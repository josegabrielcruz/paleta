import { useState, useEffect } from 'react'

/**
 * Returns the id of the section currently most visible in the viewport.
 * Uses rootMargin to trigger when a section enters the upper-middle of the screen.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const key = ids.join(',')
    if (!key) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: 0 },
    )

    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [ids.join(',')])   // eslint-disable-line react-hooks/exhaustive-deps

  return activeId
}
