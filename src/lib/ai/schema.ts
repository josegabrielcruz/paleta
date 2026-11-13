import { z } from 'zod'

const HEX_REGEX = /^#[0-9a-f]{6}$/i

const ColorSuggestion = z.object({
  hex: z.string().regex(HEX_REGEX, 'Must be a 6-digit hex color'),
  reasoning: z.string().max(200),
})

export const PaletteSchema = z.object({
  strategy: z.string().max(300),
  primary: ColorSuggestion,
  secondary: ColorSuggestion,
  neutral: ColorSuggestion,
})

export type PaletteSuggestion = z.infer<typeof PaletteSchema>
