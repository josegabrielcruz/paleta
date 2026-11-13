import { useState, useEffect } from 'react'
import { parse, converter } from 'culori'
import './SeedColorInput.css'

const toOklch = converter('oklch')

function isValidHex(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
}

function normalizeHex(value: string): string {
  const trimmed = value.trim()
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  // Expand shorthand (#abc → #aabbcc)
  if (/^#[0-9a-f]{3}$/i.test(withHash)) {
    const [, r, g, b] = withHash.split('')
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return withHash
}

interface SeedColorInputProps {
  value: string
  onChange: (hex: string) => void
}

export function SeedColorInput({ value, onChange }: SeedColorInputProps) {
  const [text, setText] = useState(value)

  // Keep text in sync when parent updates value (e.g. shuffle)
  useEffect(() => { setText(value) }, [value])

  const isInvalid = text !== '' && !isValidHex(text)

  // Native color picker — always valid, update immediately
  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const hex = e.target.value
    setText(hex)
    onChange(hex)
  }

  // Text input — validate on change, commit on blur or Enter
  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value)
  }

  function commit() {
    if (!isValidHex(text)) return
    const normalized = normalizeHex(text)
    setText(normalized)
    onChange(normalized)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
  }

  // OKLCH readout for the current valid seed
  const oklchReadout = (() => {
    try {
      const parsed = parse(value)
      if (!parsed) return null
      const ok = toOklch(parsed)
      if (!ok) return null
      return `L ${(ok.l! * 100).toFixed(0)}% · C ${ok.c!.toFixed(3)} · H ${ok.h!.toFixed(0)}°`
    } catch {
      return null
    }
  })()

  return (
    <div className="seed-input">
      <div className="seed-input__picker-wrap" style={{ background: value }}>
        <input
          className="seed-input__picker"
          type="color"
          value={value}
          onChange={handlePickerChange}
          aria-label="Seed color picker"
        />
      </div>

      <input
        className="seed-input__text"
        type="text"
        value={text}
        onChange={handleTextChange}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        data-invalid={isInvalid ? 'true' : undefined}
        placeholder="#000000"
        spellCheck={false}
        aria-label="Seed hex value"
        aria-invalid={isInvalid}
      />

      {oklchReadout && (
        <span className="seed-input__meta" aria-hidden="true">
          {oklchReadout}
        </span>
      )}
    </div>
  )
}
