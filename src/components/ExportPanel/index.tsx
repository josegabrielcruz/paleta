import { useMemo, useState, useCallback } from 'react'
import { EXPORT_FORMATS, type ExportFormatId } from '../../lib/export'
import type { TokenScale } from '../../types'
import type { UseMultiPaletteResult } from '../../hooks/useMultiPalette'
import ExportOutlineIcon from '@iconify-react/bitcoin-icons/export-outline';
import './ExportPanel.css'

const CDN_BASE = 'https://paleta-nine.vercel.app/api/css'

interface ExportPanelProps {
  lightScale: TokenScale
  darkScale: TokenScale
  multiPalette?: UseMultiPaletteResult
}

type ScaleScope = 'light' | 'dark' | 'all'
type ActiveTab = ExportFormatId | 'cdn'

export default function ExportPanel({ lightScale, darkScale, multiPalette }: ExportPanelProps) {
  const [formatId, setFormatId] = useState<ActiveTab>('css')
  const [scope, setScope]       = useState<ScaleScope>('light')
  const [copied, setCopied]     = useState(false)

  const isCdn = formatId === 'cdn'

  // Build CDN URL from seed hex values in the multi-palette
  const cdnUrl = useMemo(() => {
    if (!multiPalette) return CDN_BASE
    const p = multiPalette.primary.lightScale.seed.replace('#', '')
    const s = multiPalette.secondary.lightScale.seed.replace('#', '')
    const n = multiPalette.neutral.lightScale.seed.replace('#', '')
    return `${CDN_BASE}?p=${p}&s=${s}&n=${n}`
  }, [multiPalette])

  const cdnSnippet = `<link href="${cdnUrl}" rel="stylesheet">`

  const activeFmt = isCdn ? EXPORT_FORMATS[0] : EXPORT_FORMATS.find(f => f.id === formatId)!

  const output = useMemo(() => {
    if (scope === 'all' && multiPalette) {
      const scales = [
        multiPalette.primary.lightScale,
        multiPalette.secondary.lightScale,
        multiPalette.neutral.lightScale,
      ]
      return activeFmt.generateMulti(scales)
    }
    return activeFmt.generate(scope === 'dark' ? darkScale : lightScale)
  }, [activeFmt, scope, lightScale, darkScale, multiPalette])

  const fileName = scope === 'all'
    ? `palette.${activeFmt.fileExt}`
    : `${scope === 'dark' ? darkScale.name : lightScale.name}-${scope}.${activeFmt.fileExt}`

  const handleCopy = useCallback(async () => {
    const text = isCdn ? cdnSnippet : output
    try { await navigator.clipboard.writeText(text) }
    catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [isCdn, cdnSnippet, output])

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: activeFmt.mimeType })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }, [output, activeFmt, fileName])

  const scopes: { id: ScaleScope; label: string }[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark',  label: 'Dark'  },
    ...(multiPalette ? [{ id: 'all' as ScaleScope, label: 'All scales' }] : []),
  ]

  return (
    <section className="ep" aria-label="Export palette">

      <div className="ep-header">
        <span className="ep-eyebrow">Export</span>
        <div className="ep-header__line" aria-hidden="true" />
        <div className="ep-toggle" role="group" aria-label="Select export scope">
          {scopes.map(s => (
            <button
              key={s.id}
              className={`ep-toggle__btn${scope === s.id ? ' ep-toggle__btn--active' : ''}`}
              onClick={() => setScope(s.id)}
              aria-pressed={scope === s.id}
            >{s.label}</button>
          ))}
        </div>
      </div>

      <div className="ep-formats" role="tablist" aria-label="Export format">
        {EXPORT_FORMATS.map(fmt => (
          <button
            key={fmt.id}
            role="tab"
            aria-selected={fmt.id === formatId}
            className={`ep-fmt-btn${fmt.id === formatId ? ' ep-fmt-btn--active' : ''}`}
            onClick={() => setFormatId(fmt.id)}
          >{fmt.label}</button>
        ))}
        <button
          role="tab"
          aria-selected={formatId === 'cdn'}
          className={`ep-fmt-btn ep-fmt-btn--cdn${formatId === 'cdn' ? ' ep-fmt-btn--active' : ''}`}
          onClick={() => setFormatId('cdn')}
        >CDN Link &nbsp;<ExportOutlineIcon height="16px" /></button>
      </div>

      {isCdn ? (
        <div className="ep-cdn">
          <p className="ep-cdn__desc">
            Drop this into any HTML page to use your palette as CSS variables.
          </p>
          <div className="ep-preview-wrap">
            <pre className="ep-preview"><code>{cdnSnippet}</code></pre>
            <div className="ep-actions">
              <button className="ep-btn ep-btn--copy" onClick={handleCopy} aria-live="polite">
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <a className="ep-btn ep-btn--download" href={cdnUrl} target="_blank" rel="noopener noreferrer">
                Preview
              </a>
            </div>
          </div>
          <p className="ep-cdn__vars">
            Provides <code>--color-primary-*</code>, <code>--color-secondary-*</code>, <code>--color-neutral-*</code> (steps 50–950).
          </p>
        </div>
      ) : (
        <div className="ep-preview-wrap">
          <pre className="ep-preview" role="tabpanel" aria-label={`${activeFmt.label} output`}>
            <code>{output}</code>
          </pre>
          <div className="ep-actions">
            <button className="ep-btn ep-btn--copy" onClick={handleCopy} aria-live="polite">
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="ep-btn ep-btn--download" onClick={handleDownload}>
              Download .{activeFmt.fileExt}
            </button>
          </div>
        </div>
      )}

    </section>
  )
}
