import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateScale } from '../src/lib/palette'

const HEX_RE = /^[0-9a-f]{6}$/i

function sanitize(raw: string | undefined, fallback: string): string {
  const val = (raw ?? '').replace(/[^0-9a-f]/gi, '').slice(0, 6)
  return HEX_RE.test(val) ? val : fallback
}

export default function handler(req: VercelRequest, res: VercelResponse): void {
  const p = sanitize(req.query['p'] as string, '2563eb')
  const s = sanitize(req.query['s'] as string, '7c3aed')
  const n = sanitize(req.query['n'] as string, '374151')

  const primary   = generateScale(`#${p}`, 'primary')
  const secondary = generateScale(`#${s}`, 'secondary')
  const neutral   = generateScale(`#${n}`, 'neutral')

  const lines = [
    `/* paleta — generated color system */`,
    `/* https://paleta-nine.vercel.app?p=${p}&s=${s}&n=${n} */`,
    ``,
    `:root {`,
    ...[primary, secondary, neutral].flatMap(scale =>
      scale.stops.map(stop => `  --color-${scale.name}-${stop.step}: ${stop.cssOklch};`)
    ),
    `}`,
  ]

  res.setHeader('Content-Type', 'text/css; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=3600')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.send(lines.join('\n'))
}
