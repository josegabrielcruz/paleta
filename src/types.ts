// ─── Color primitives ────────────────────────────────────────────────────────

export interface OklchValues {
  l: number   // lightness  0–1
  c: number   // chroma     0–~0.4 (varies by hue)
  h: number   // hue        0–360
}

// ─── Palette scale ───────────────────────────────────────────────────────────

export type ScaleStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

export interface ColorStop {
  step: ScaleStep
  hex: string       // '#2563eb'
  oklch: OklchValues
  cssOklch: string  // 'oklch(55.5% 0.2210 264.1)'
}

export interface TokenScale {
  seed: string        // original input hex
  name: string        // 'primary' | 'secondary' | etc.
  stops: ColorStop[]  // ordered light → dark (50 → 950)
}

// ─── Contrast ────────────────────────────────────────────────────────────────

export interface ContrastPair {
  fgStep: ScaleStep
  bgStep: ScaleStep
  ratio: number
  passAA: boolean       // 4.5:1 for normal text
  passAALarge: boolean  // 3:1 for large text / UI components
  passAAA: boolean      // 7:1 for enhanced
}

// ─── Export ───────────────────────────────────────────────────────────────────

export type ExportFormat = 'css' | 'tailwind' | 'tailwind-v4' | 'figma' | 'style-dictionary'
