import { ImageResponse } from '@vercel/og'

// Node.js serverless runtime (default) — @vercel/og v1.x is incompatible with Edge outside Next.js

const SEEDS = [
  { label: 'Primary',   key: 'p', fallback: '2563eb' },
  { label: 'Secondary', key: 's', fallback: '7c3aed' },
  { label: 'Neutral',   key: 'n', fallback: '374151' },
]

export default function handler(req: Request): Response {
  const { searchParams } = new URL(req.url)

  const colors = SEEDS.map(({ label, key, fallback }) => ({
    label,
    hex: `#${searchParams.get(key)?.replace(/[^0-9a-f]/gi, '') ?? fallback}`,
  }))

  return new ImageResponse(
    // @ts-expect-error — JSX processed by Vercel's esbuild, not tsc
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#111111',
        padding: '56px 64px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '44px' }}>
        <span style={{ fontSize: '32px', fontWeight: 700, color: '#ededed', letterSpacing: '-0.02em' }}>
          paleta
        </span>
      </div>

      {/* Color strips */}
      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        {colors.map(({ label, hex }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' }}>
            <div
              style={{
                flex: 1,
                background: hex,
                borderRadius: '10px',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: '#555555', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {label}
              </span>
              <span style={{ fontSize: '20px', color: '#888888', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                {hex}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '36px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ fontSize: '11px', color: '#444444', letterSpacing: '0.1em' }}>
          GENERATED WITH PALETA
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}
