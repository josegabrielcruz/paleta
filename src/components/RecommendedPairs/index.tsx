import { useMemo } from 'react'
import type { TokenScale } from '../../types'
import { lightSurfacePairings, darkSurfacePairings, type SemanticPairing } from '../../lib/semanticPairs'
import './RecommendedPairs.css'

interface RecommendedPairsProps {
  lightScale: TokenScale
  darkScale: TokenScale
}

const LEVEL_LABEL: Record<string, string> = {
  AAA: 'AAA',
  AA: 'AA',
  AALarge: 'AA Lg',
}

function PairingRow({ p }: { p: SemanticPairing }) {
  return (
    <div className="rp-row">
      <div className="rp-row__swatches" aria-hidden="true">
        <span className="rp-row__swatch" style={{ background: p.bgStop.hex }} title={`bg step ${p.bgStop.step}`} />
        <span className="rp-row__swatch rp-row__swatch--fg" style={{ background: p.fgStop.hex }} title={`fg step ${p.fgStop.step}`} />
      </div>
      <div className="rp-row__info">
        <span className="rp-row__use-case">{p.useCase}</span>
        <span className="rp-row__steps">{p.pair.fgStep} on {p.pair.bgStep}</span>
      </div>
      <span className="rp-row__ratio">{p.pair.ratio.toFixed(1)}:1</span>
      <span className={`rp-row__badge rp-row__badge--${p.level.toLowerCase().replace(' ', '')}`}>
        {LEVEL_LABEL[p.level]}
      </span>
    </div>
  )
}

function PairingGroup({ title, pairings }: { title: string; pairings: SemanticPairing[] }) {
  if (pairings.length === 0) return null

  return (
    <div className="rp-group">
      <span className="rp-group__label">{title}</span>
      <div className="rp-group__rows">
        {pairings.map(p => <PairingRow key={`${p.useCase}-${p.pair.fgStep}-${p.pair.bgStep}`} p={p} />)}
      </div>
    </div>
  )
}

export function RecommendedPairs({ lightScale, darkScale }: RecommendedPairsProps) {
  const lightPairs = useMemo(() => lightSurfacePairings(lightScale.stops), [lightScale])
  const darkPairs  = useMemo(() => darkSurfacePairings(darkScale.stops),   [darkScale])

  if (lightPairs.length === 0 && darkPairs.length === 0) return null

  return (
    <div className="rp">
      <div className="rp-header">
        <span className="rp-eyebrow">Recommended pairings</span>
        <div className="rp-header__line" />
      </div>

      <div className="rp-body">
        <PairingGroup title="Light surface" pairings={lightPairs} />
        <PairingGroup title="Dark surface"  pairings={darkPairs} />
      </div>
    </div>
  )
}
