import PaletteScale from '../PaletteScale'
import type { TokenScale } from '../../types'
import './DarkLightPair.css'

interface DarkLightPairProps {
  lightScale: TokenScale
  darkScale: TokenScale
}

export default function DarkLightPair({ lightScale, darkScale }: DarkLightPairProps) {
  return (
    <section className="dlp">
      <div className="dlp-track dlp-track--light">
        <span className="dlp-label">Light</span>
        <PaletteScale scale={lightScale} />
      </div>
      <div className="dlp-track dlp-track--dark">
        <span className="dlp-label">Dark</span>
        <PaletteScale scale={darkScale} />
      </div>
    </section>
  )
}
