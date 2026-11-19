import { useState, useEffect, useCallback } from 'react'
import type { MultiSeeds } from './useMultiPalette'

export interface HistoryEntry {
  id: string
  seeds: MultiSeeds
  savedAt: number
}

const STORAGE_KEY = 'paleta-history'
const MAX_ENTRIES = 12
// Wait 1.5s after the last seed change before persisting — prevents saving every drag tick
const DEBOUNCE_MS = 1500

function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch { /* storage unavailable or full */ }
}

export function usePaletteHistory(seeds: MultiSeeds) {
  const [history, setHistory] = useState<HistoryEntry[]>(readHistory)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory(prev => {
        // Skip if seeds are identical to the most-recent entry
        const top = prev[0]
        if (
          top?.seeds.primary   === seeds.primary &&
          top?.seeds.secondary === seeds.secondary &&
          top?.seeds.neutral   === seeds.neutral
        ) return prev

        const id = `${seeds.primary}-${seeds.secondary}-${seeds.neutral}`

        // Remove any existing entry with the same seed combination
        const filtered = prev.filter(e => e.id !== id)

        const next: HistoryEntry[] = [
          { id, seeds, savedAt: Date.now() },
          ...filtered,
        ].slice(0, MAX_ENTRIES)

        writeHistory(next)
        return next
      })
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [seeds.primary, seeds.secondary, seeds.neutral]) // eslint-disable-line react-hooks/exhaustive-deps

  const clearHistory = useCallback(() => {
    setHistory([])
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }, [])

  return { history, clearHistory }
}
