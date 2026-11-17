import fs from 'node:fs'
import { initWasm, Resvg } from '@resvg/resvg-wasm'

let wasmReady = false

async function ensureWasm(): Promise<void> {
  if (wasmReady) return
  // Load bundled WASM from node_modules — works in Vercel Node.js runtime
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const wasmPath = require.resolve('@resvg/resvg-wasm/index_bg.wasm')
  const wasmData = fs.readFileSync(wasmPath)
  await initWasm(wasmData)
  wasmReady = true
}

const HEX_RE = /^[0-9a-f]{6}$/i

function sanitize(raw: string | null, fallback: string): string {
  const val = (raw ?? '').replace('#', '')
  return HEX_RE.test(val) ? `#${val}` : fallback
}

function buildSvg(colors: { label: string; hex: string }[]): string {
  const W = 1200
  const H = 630
  const PAD = 60
  const GAP = 24
  const stripW = Math.floor((W - PAD * 2 - GAP * (colors.length - 1)) / colors.length)
  const headerH = 80
  const footerH = 56
  const stripH = H - PAD * 2 - headerH - footerH

  const strips = colors.map(({ label, hex }, i) => {
    const x = PAD + i * (stripW + GAP)
    const y = PAD + headerH
    return `
      <rect x="${x}" y="${y}" width="${stripW}" height="${stripH}" rx="10" fill="${hex}"/>
      <text x="${x}" y="${y + stripH + 22}" font-family="sans-serif" font-size="11" fill="#555555" letter-spacing="1.5">${label.toUpperCase()}</text>
      <text x="${x}" y="${y + stripH + 48}" font-family="monospace" font-size="20" fill="#888888">${hex}</text>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#111111"/>
  <text x="${PAD}" y="${PAD + 32}" font-family="sans-serif" font-size="30" font-weight="700" fill="#ededed">paleta</text>
  ${strips}
  <text x="${PAD}" y="${H - 20}" font-family="sans-serif" font-size="11" fill="#444444" letter-spacing="1.5">GENERATED WITH PALETA ✦</text>
</svg>`
}

export default async function handler(req: Request): Promise<Response> {
  await ensureWasm()

  const { searchParams } = new URL(req.url)
  const colors = [
    { label: 'Primary',   hex: sanitize(searchParams.get('p'), '#2563eb') },
    { label: 'Secondary', hex: sanitize(searchParams.get('s'), '#7c3aed') },
    { label: 'Neutral',   hex: sanitize(searchParams.get('n'), '#374151') },
  ]

  const svg = buildSvg(colors)
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const png = resvg.render().asPng()

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, s-maxage=86400, max-age=86400',
    },
  })
}
