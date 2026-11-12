// ─── Color vision deficiency simulation via SVG feColorMatrix ────────────────
//
// Matrices sourced from Machado, Oliveira & Fernandes (2009) and the W3C
// Color Accessibility Guidelines. Each matrix is a 4×5 RGBA transformation
// applied by an SVG <feColorMatrix type="matrix"> filter.
//
// Row order: [R', G', B', A'] — the 5th column is a bias term (always 0 here).

export type SimulationType =
  | 'none'
  | 'deuteranopia'   // green-blind (most common, ~1% of males)
  | 'protanopia'     // red-blind (~1% of males)
  | 'tritanopia'     // blue-blind (rare, ~0.003%)
  | 'achromatopsia'  // complete color blindness (very rare)

export interface SimulationMeta {
  id: SimulationType
  label: string
  description: string
  matrix: string | null  // null = no filter (normal vision)
}

// Values follow the Machado 2009 severity-1.0 matrices for protan/deutan
// and the common Brettel approximation for tritan.
const MATRICES: Record<Exclude<SimulationType, 'none'>, number[]> = {
  deuteranopia: [
    0.367, 0.861, -0.228, 0, 0,
    0.280, 0.673,  0.047, 0, 0,
   -0.012, 0.043,  0.969, 0, 0,
    0,     0,      0,     1, 0,
  ],
  protanopia: [
    0.152, 1.053, -0.205, 0, 0,
    0.115, 0.786,  0.099, 0, 0,
   -0.004, -0.048, 1.052, 0, 0,
    0,      0,     0,     1, 0,
  ],
  tritanopia: [
    1.256, -0.077, -0.179, 0, 0,
   -0.079,  0.931,  0.148, 0, 0,
    0.005,  0.692,  0.303, 0, 0,
    0,      0,      0,     1, 0,
  ],
  achromatopsia: [
    0.213, 0.715, 0.072, 0, 0,
    0.213, 0.715, 0.072, 0, 0,
    0.213, 0.715, 0.072, 0, 0,
    0,     0,     0,     1, 0,
  ],
}

export const SIMULATIONS: SimulationMeta[] = [
  {
    id: 'none',
    label: 'Normal',
    description: 'Standard color vision',
    matrix: null,
  },
  {
    id: 'deuteranopia',
    label: 'Deuteranopia',
    description: 'Green-blind (most common, ~8% of males)',
    matrix: MATRICES.deuteranopia.join(' '),
  },
  {
    id: 'protanopia',
    label: 'Protanopia',
    description: 'Red-blind (~1% of males)',
    matrix: MATRICES.protanopia.join(' '),
  },
  {
    id: 'tritanopia',
    label: 'Tritanopia',
    description: 'Blue-blind (rare, ~0.003%)',
    matrix: MATRICES.tritanopia.join(' '),
  },
  {
    id: 'achromatopsia',
    label: 'Achromatopsia',
    description: 'Complete color blindness (very rare)',
    matrix: MATRICES.achromatopsia.join(' '),
  },
]

/** Returns a unique SVG filter id for the given simulation type. */
export function filterId(type: SimulationType): string {
  return `paleta-cvd-${type}`
}

/** Builds the full SVG <defs> block with all CVD filter definitions. */
export function buildFilterDefs(): string {
  return SIMULATIONS.filter(s => s.matrix !== null)
    .map(
      s =>
        `<filter id="${filterId(s.id as Exclude<SimulationType, 'none'>)}" color-interpolation-filters="linearRGB">` +
        `<feColorMatrix type="matrix" values="${s.matrix}"/>` +
        `</filter>`,
    )
    .join('')
}
