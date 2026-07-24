import { getNodesBounds, getViewportForBounds, type Node } from '@xyflow/react'
import { toPng } from 'html-to-image'
import type { Backstory } from '../domain/types'

// Export size presets keyed by the target long-edge pixel length. The canvas
// follows the board's own aspect ratio (no forced 16:9 letterboxing), so every
// pixel is content — the board stays crisp when zoomed. Facebook keeps images
// sharp up to ~2048px on the long edge, so that's the "post to Facebook" pick.
export const SIZE_PRESETS = {
  facebook: { longEdge: 2048, label: 'พอดีเฟซบุ๊ก (2048px)' },
  sharp: { longEdge: 3200, label: 'คมชัด (3200px)' },
  xlarge: { longEdge: 4600, label: 'ใหญ่พิเศษ (4600px)' },
} as const

export type SizeKey = keyof typeof SIZE_PRESETS

// Guard against browser canvas limits (~16k px / ~256MP area).
const MAX_EDGE = 12000

const LIGHT_BG = '#f8fafc'
const CREAM = '#f8f6f0'
const INK = '#141619'
const INK_MUTED = 'rgba(20,22,25,0.5)'
const SAND_PANEL = '#f6e6cb'
const SAND_BORDER = '#dba867'

export interface PngOptions {
  size: SizeKey
  transparent: boolean
  includeBackstory: boolean
  backstory: Backstory
  title: string
}

// Breathing room around the board content, in flow (unscaled) pixels.
const CONTENT_PAD = 90

/**
 * Render the whole board (including off-screen nodes) to a PNG data URL. The
 * canvas matches the board's aspect ratio and is scaled so its long edge hits
 * the chosen preset — so the result is full-bleed content at high resolution
 * rather than a low-res board letterboxed inside a 16:9 frame.
 */
export async function exportBoardPng(
  nodes: Node[],
  opts: PngOptions,
): Promise<string> {
  if (nodes.length === 0) throw new Error('ไม่มีโหนดให้ส่งออก')

  const bounds = getNodesBounds(nodes)
  const contentW = bounds.width + CONTENT_PAD * 2
  const contentH = bounds.height + CONTENT_PAD * 2

  // Scale so the long edge reaches the target; clamp to the canvas limit.
  const target = SIZE_PRESETS[opts.size].longEdge
  let scale = target / Math.max(contentW, contentH)
  scale = Math.min(scale, MAX_EDGE / Math.max(contentW, contentH))

  const width = Math.round(contentW * scale)
  const height = Math.round(contentH * scale)

  // Canvas matches board aspect → getViewportForBounds gives ~1:1 fit, no bars.
  const transform = getViewportForBounds(bounds, width, height, 0.02, 10, 0.04)

  const viewport = document.querySelector<HTMLElement>('.react-flow__viewport')
  if (!viewport) throw new Error('ไม่พบพื้นที่กระดาน (viewport)')

  const boardUrl = await toPng(viewport, {
    width,
    height,
    backgroundColor: opts.transparent ? undefined : LIGHT_BG,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
    },
  })

  return composeExport(boardUrl, opts)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('โหลดภาพกระดานไม่สำเร็จ'))
    img.src = src
  })
}

const BACKSTORY_ROWS: [keyof Backstory, string][] = [
  ['ghost', 'Ghost'],
  ['lie', 'Lie'],
  ['lieAtWork', 'Lie at Work'],
  ['want', 'Want'],
  ['need', 'Need'],
]

const MARKER_COLOR: Record<keyof Backstory, string> = {
  ghost: '#cd5042',
  lie: INK,
  lieAtWork: INK,
  want: '#cd5042',
  need: '#2f9c6c',
}

/**
 * Compose the final image: a title header (always) and — when requested — a
 * distinct sand-panelled Backstory block, stacked above the board so the two
 * read as clearly separate sections.
 */
async function composeExport(
  boardUrl: string,
  opts: PngOptions,
): Promise<string> {
  // Make sure the display face is available to the canvas before drawing.
  await document.fonts?.ready
  const img = await loadImage(boardUrl)
  const width = img.width
  const scale = width / 1920
  const pad = Math.round(56 * scale)

  const titleH = Math.round(150 * scale)
  const rowH = Math.round(46 * scale)
  const bsInnerTop = Math.round(64 * scale)
  const backstoryH = opts.includeBackstory
    ? bsInnerTop + BACKSTORY_ROWS.length * rowH + Math.round(40 * scale)
    : 0
  const headerH = titleH + backstoryH

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = img.height + headerH
  const ctx = canvas.getContext('2d')
  if (!ctx) return boardUrl

  if (!opts.transparent) {
    ctx.fillStyle = CREAM
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // --- Title header ---
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = INK_MUTED
  ctx.font = `600 ${Math.round(20 * scale)}px "Noto Sans Thai", sans-serif`
  ctx.letterSpacing = `${Math.round(3 * scale)}px`
  ctx.fillText('PLOTLINE BOARD', pad, Math.round(50 * scale))
  ctx.letterSpacing = '0px'
  ctx.fillStyle = INK
  ctx.font = `700 ${Math.round(52 * scale)}px "Trirong", Georgia, serif`
  ctx.fillText(opts.title || 'ไม่มีชื่อเรื่อง', pad, Math.round(110 * scale))
  // rule under the title
  ctx.strokeStyle = 'rgba(20,22,25,0.2)'
  ctx.lineWidth = Math.max(1, Math.round(1.5 * scale))
  ctx.beginPath()
  ctx.moveTo(pad, titleH - Math.round(18 * scale))
  ctx.lineTo(width - pad, titleH - Math.round(18 * scale))
  ctx.stroke()

  // --- Backstory panel (visually distinct sand card) ---
  if (opts.includeBackstory) {
    const px = pad
    const py = titleH
    const pw = width - pad * 2
    const ph = backstoryH - Math.round(16 * scale)
    ctx.fillStyle = SAND_PANEL
    ctx.strokeStyle = SAND_BORDER
    ctx.lineWidth = Math.max(1, Math.round(1.5 * scale))
    roundRect(ctx, px, py, pw, ph, Math.round(14 * scale))
    ctx.fill()
    ctx.stroke()

    const inX = px + Math.round(32 * scale)
    ctx.fillStyle = INK
    ctx.font = `700 ${Math.round(26 * scale)}px "Trirong", Georgia, serif`
    ctx.fillText('Backstory · Character Arc', inX, py + Math.round(42 * scale))

    let y = py + bsInnerTop + Math.round(28 * scale)
    const markerX = inX + Math.round(8 * scale)
    const labelX = inX + Math.round(34 * scale)
    const valueX = inX + Math.round(210 * scale)
    for (const [key, label] of BACKSTORY_ROWS) {
      const m = Math.round(13 * scale)
      ctx.fillStyle = MARKER_COLOR[key]
      if (key === 'want') {
        ctx.fillRect(markerX - m / 2, y - m, m, m)
      } else {
        ctx.beginPath()
        ctx.arc(markerX, y - m / 2, m / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = INK
      ctx.font = `600 ${Math.round(21 * scale)}px "Trirong", Georgia, serif`
      ctx.fillText(label, labelX, y)
      ctx.fillStyle = 'rgba(20,22,25,0.72)'
      ctx.font = `${Math.round(20 * scale)}px "Noto Sans Thai", sans-serif`
      ctx.fillText(truncate(opts.backstory[key] || '—', 118), valueX, y)
      y += rowH
    }
  }

  ctx.drawImage(img, 0, headerH)
  return canvas.toDataURL('image/png')
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

/** Trigger a browser download for a data URL. */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}
