import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PNG } from 'pngjs'

const HEX_RE = /^[0-9a-f]{6}$/i

function sanitize(raw: string | null | undefined, fallback: string): string {
  const val = (raw ?? '').replace('#', '')
  return HEX_RE.test(val) ? val : fallback
}

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]
}

function fillRect(data: Buffer, W: number, x: number, y: number, w: number, h: number, r: number, g: number, b: number): void {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      const i = (W * py + px) << 2
      data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255
    }
  }
}

export default function handler(req: VercelRequest, res: VercelResponse): void {
  const p = sanitize(req.query['p'] as string, '2563eb')
  const s = sanitize(req.query['s'] as string, '7c3aed')
  const n = sanitize(req.query['n'] as string, '374151')

  const W = 1200
  const H = 630
  const PAD = 60
  const GAP = 20
  const NUM = 3
  const STRIP_W = Math.floor((W - PAD * 2 - GAP * (NUM - 1)) / NUM)
  const STRIP_H = H - PAD * 2 - 80
  const STRIP_Y = PAD + 40

  const png = new PNG({ width: W, height: H })

  // Dark background
  fillRect(png.data, W, 0, 0, W, H, 17, 17, 17)

  // Three color strips with simulated rounded corners
  for (const [i, hex] of [p, s, n].entries()) {
    const [r, g, b] = hexToRgb(hex)
    const x = PAD + i * (STRIP_W + GAP)
    fillRect(png.data, W, x + 8, STRIP_Y, STRIP_W - 16, STRIP_H, r, g, b)
    fillRect(png.data, W, x, STRIP_Y + 8, STRIP_W, STRIP_H - 16, r, g, b)
  }

  const buffer = PNG.sync.write(png)

  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=86400')
  res.send(buffer)
}
