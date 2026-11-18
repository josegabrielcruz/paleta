import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useMultiPalette } from './hooks/useMultiPalette'
import { complementary, neutralFromPrimary } from './lib/harmony'
import { randomSeed } from './lib/shuffle'
import { SIMULATIONS, filterId, type SimulationType } from './lib/simulate'
import type { MultiSeeds } from './hooks/useMultiPalette'
import { FadeInSection } from './components/FadeInSection'
import { StickyControls } from './components/StickyControls'
import { SectionNav } from './components/SectionNav'
import { PaletteHeader } from './components/PaletteHeader'
import { SectionHeading } from './components/SectionHeading'
import { useTheme } from './hooks/useTheme'
import { BrandInput } from './components/BrandInput'
import SeedRow from './components/SeedRow'
import SimulationBar from './components/SimulationBar'
import { P3ModeBar } from './components/P3ModeBar'
import DiscoveryBar from './components/DiscoveryBar'
import MultiScaleDisplay from './components/MultiScaleDisplay'
import DarkLightPair from './components/DarkLightPair'
import SemanticTokenGrid from './components/SemanticTokenGrid'
import ContrastMatrix from './components/ContrastMatrix'
import { RecommendedPairs } from './components/RecommendedPairs'
import ComponentPreview from './components/ComponentPreview'
import ExportPanel from './components/ExportPanel'
import { Analytics } from '@vercel/analytics/react';

// ─── URL state codec ──────────────────────────────────────────────────────────

function parseUrlState(): { seeds: MultiSeeds; simulation: SimulationType } | null {
  const p = new URLSearchParams(window.location.search)
  const primary = p.get('p')
  if (!primary) return null
  const seeds: MultiSeeds = {
    primary:   `#${primary}`,
    secondary: p.get('s') ? `#${p.get('s')}` : complementary(`#${primary}`),
    neutral:   p.get('n') ? `#${p.get('n')}` : neutralFromPrimary(`#${primary}`),
  }
  const sim = p.get('sim') ?? 'none'
  const simulation = (SIMULATIONS.some(s => s.id === sim) ? sim : 'none') as SimulationType
  return { seeds, simulation }
}

function encodeUrl(seeds: MultiSeeds, simulation: SimulationType): void {
  const p = new URLSearchParams()
  p.set('p', seeds.primary.replace('#', ''))
  p.set('s', seeds.secondary.replace('#', ''))
  p.set('n', seeds.neutral.replace('#', ''))
  if (simulation !== 'none') p.set('sim', simulation)
  window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`)
}

// ─── Default state ────────────────────────────────────────────────────────────

const INITIAL_PRIMARY = '#2563eb'

function defaultSeeds(): MultiSeeds {
  return {
    primary:   INITIAL_PRIMARY,
    secondary: complementary(INITIAL_PRIMARY),
    neutral:   neutralFromPrimary(INITIAL_PRIMARY),
  }
}

export default function App() {
  const initial = parseUrlState()
  const [seeds, setSeeds]           = useState<MultiSeeds>(initial?.seeds ?? defaultSeeds())
  const [simulation, setSimulation] = useState<SimulationType>(initial?.simulation ?? 'none')
  const [p3Mode, setP3Mode]         = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  const controlsRef = useRef<HTMLDivElement>(null)

  // Keep URL in sync whenever state changes
  useEffect(() => { encodeUrl(seeds, simulation) }, [seeds, simulation])

  // Show sticky controls once the top controls section leaves viewport
  useEffect(() => {
    const el = controlsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleShuffle = useCallback(() => {
    const primary = randomSeed()
    setSeeds({
      primary,
      secondary: complementary(primary),
      neutral:   neutralFromPrimary(primary),
    })
  }, [])

  const { theme, toggle: toggleTheme } = useTheme()
  const multiPalette = useMultiPalette(seeds, p3Mode)
  const { lightScale, darkScale } = multiPalette.primary
  const activeFilter   = simulation !== 'none' ? `url(#${filterId(simulation)})` : undefined
  const prefersReduced = useReducedMotion()

  const mountItem = (delay: number) => ({
    initial:    { opacity: 0, y: prefersReduced ? 0 : 24 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: prefersReduced ? 0 : 0.6, delay: prefersReduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
  })

  return (
    <>
      {/* Hidden SVG that declares all CVD filter definitions */}
      <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          {SIMULATIONS.filter(s => s.matrix !== null).map(s => (
            <filter
              key={s.id}
              id={filterId(s.id as Exclude<SimulationType, 'none'>)}
              colorInterpolationFilters="linearRGB"
            >
              <feColorMatrix type="matrix" values={s.matrix!} />
            </filter>
          ))}
        </defs>
      </svg>

      {/* Fixed overlays — outside max-width container */}
      <PaletteHeader theme={theme} onToggleTheme={toggleTheme} />
      <StickyControls seeds={seeds} visible={stickyVisible} onShuffle={handleShuffle} />
      <SectionNav visible={stickyVisible} />

      <main className="paleta-app">

        {/* ref'd section so we know when it leaves the viewport */}
        <div ref={controlsRef} id="section-controls">

          {/* Hero — editorial tagline + AI input */}
          <div className="paleta-hero">
            <div className="paleta-hero__text">
              <motion.h1 className="paleta-hero__headline" {...mountItem(0)}>
                Design systems that<br />start with an intention.
              </motion.h1>
              <motion.p className="paleta-hero__sub" {...mountItem(0.09)}>
                {`Describe your brand in plain language. Paleta generates a complete OKLCH color system -> scales, tokens, contrast, and components.`}
              </motion.p>
            </div>
            <motion.div {...mountItem(0.18)}>
              <BrandInput onApply={setSeeds} />
            </motion.div>
          </div>

          {/* Divider */}
          <div className="paleta-controls-divider" role="separator">
            <span>or start with a color</span>
          </div>

          {/* Manual controls */}
          <div className="paleta-manual-controls">
            <motion.div {...mountItem(0.18)}>
              <SeedRow
                primarySeed={seeds.primary}
                secondarySeed={seeds.secondary}
                neutralSeed={seeds.neutral}
                onPrimaryChange={hex   => setSeeds(s => ({ ...s, primary: hex }))}
                onSecondaryChange={hex => setSeeds(s => ({ ...s, secondary: hex }))}
                onNeutralChange={hex   => setSeeds(s => ({ ...s, neutral: hex }))}
              />
            </motion.div>
            <motion.div {...mountItem(0.22)}>
              <DiscoveryBar onApplyPreset={setSeeds} onShuffle={handleShuffle} />
            </motion.div>
            <motion.div {...mountItem(0.26)}>
              <SimulationBar active={simulation} onChange={setSimulation} />
            </motion.div>
            <motion.div {...mountItem(0.30)}>
              <P3ModeBar active={p3Mode} onChange={setP3Mode} />
            </motion.div>
          </div>

        </div>

        {/* Everything below this div is affected by the active CVD filter */}
        <div style={{ filter: activeFilter }}>
          <div className="paleta-sections">
            <div id="section-scales">
              <SectionHeading number="01" title="Color Scales" />
              <FadeInSection><MultiScaleDisplay multiPalette={multiPalette} /></FadeInSection>
              <FadeInSection><DarkLightPair lightScale={lightScale} darkScale={darkScale} /></FadeInSection>
            </div>
            <div id="section-tokens">
              <SectionHeading number="02" title="Semantic Tokens" />
              <FadeInSection><SemanticTokenGrid lightScale={lightScale} darkScale={darkScale} /></FadeInSection>
            </div>
            <div id="section-contrast">
              <SectionHeading number="03" title="Contrast Matrix" />
              <div className="contrast-layout">
                <FadeInSection><ContrastMatrix lightScale={lightScale} darkScale={darkScale} /></FadeInSection>
                <FadeInSection><RecommendedPairs lightScale={lightScale} darkScale={darkScale} /></FadeInSection>
              </div>
            </div>
            <div id="section-preview">
              <SectionHeading number="04" title="Component Preview" />
              <FadeInSection><ComponentPreview lightScale={lightScale} darkScale={darkScale} multiPalette={multiPalette} /></FadeInSection>
            </div>
            <div id="section-export">
              <SectionHeading number="05" title="Export" />
              <FadeInSection><ExportPanel lightScale={lightScale} darkScale={darkScale} multiPalette={multiPalette} /></FadeInSection>
            </div>
          </div>
        </div>
      </main>
      <Analytics />
    </>
  )
}
