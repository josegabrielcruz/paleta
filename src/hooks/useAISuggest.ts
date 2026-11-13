import { useState, useCallback, useRef } from 'react'
import { PaletteSchema } from '../lib/ai/schema'
import { extractSeeds } from '../lib/ai/parseResponse'
import type { MultiSeeds } from './useMultiPalette'

export interface AISuggestion {
  strategy: string
  seeds: MultiSeeds
  reasoning: { primary: string; secondary: string; neutral: string }
}

export type AISuggestStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

export interface UseAISuggestReturn {
  status: AISuggestStatus
  suggestion: AISuggestion | null
  // Hex values extracted from the stream before it completes
  partialSeeds: Partial<MultiSeeds>
  streamingText: string
  error: string | null
  generate: (description: string) => void
  reset: () => void
}

// Matches completed "hex": "#rrggbb" pairs as they appear in the JSON stream
const HEX_IN_JSON_RE = /"hex"\s*:\s*"(#[0-9a-f]{6})"/gi

export function useAISuggest(): UseAISuggestReturn {
  const [status, setStatus] = useState<AISuggestStatus>('idle')
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const [partialSeeds, setPartialSeeds] = useState<Partial<MultiSeeds>>({})
  const [streamingText, setStreamingText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setStatus('idle')
    setSuggestion(null)
    setPartialSeeds({})
    setStreamingText('')
    setError(null)
  }, [])

  const generate = useCallback(async (description: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setSuggestion(null)
    setPartialSeeds({})
    setStreamingText('')
    setError(null)

    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`)
      }
      if (!response.body) {
        throw new Error('No response body received')
      }

      setStatus('streaming')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        accumulated += decoder.decode(value, { stream: true })
        setStreamingText(accumulated)

        // Update color swatches as each hex value completes in the stream
        const matches = [...accumulated.matchAll(HEX_IN_JSON_RE)]
        if (matches.length > 0) {
          setPartialSeeds({
            ...(matches[0] && { primary: matches[0][1] }),
            ...(matches[1] && { secondary: matches[1][1] }),
            ...(matches[2] && { neutral: matches[2][1] }),
          })
        }
      }

      const parsed = PaletteSchema.parse(JSON.parse(accumulated))
      setSuggestion({
        strategy: parsed.strategy,
        seeds: extractSeeds(parsed),
        reasoning: {
          primary: parsed.primary.reasoning,
          secondary: parsed.secondary.reasoning,
          neutral: parsed.neutral.reasoning,
        },
      })
      setStatus('done')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Unexpected error')
      setStatus('error')
    }
  }, [])

  return { status, suggestion, partialSeeds, streamingText, error, generate, reset }
}
