import {
  getNodesBounds,
  getViewportForBounds,
  type Node,
  type Rect,
} from '@xyflow/react'
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

// Facebook re-encodes every photo down to 2048px on the long edge. Slices of
// ~2000 flow px render 1:1 inside that budget, so text stays readable after
// Facebook's resize. The overlap is wider than a scene card (~300px): a card
// sitting on a cut line always appears whole in at least one slice.
const SLICE_TARGET_W = 1700
const SLICE_OVERLAP = 160

function paddedBounds(nodes: Node[]): Rect {
  const b = getNodesBounds(nodes)
  return {
    x: b.x - CONTENT_PAD,
    y: b.y - CONTENT_PAD,
    width: b.width + CONTENT_PAD * 2,
    height: b.height + CONTENT_PAD * 2,
  }
}

/** Render one rectangular region of the board to a PNG data URL. */
async function renderRegion(rect: Rect, opts: PngOptions): Promise<string> {
  // Scale so the long edge reaches the target — but never render below the
  // board's native scale (1 flow px = 1 image px). A fixed long edge squeezes
  // big boards until cards are a few dozen pixels wide and text shatters, so
  // for large boards the image grows past the preset instead. The canvas
  // limit still wins so the export cannot blank out on huge boards.
  const target = SIZE_PRESETS[opts.size].longEdge
  const longEdge = Math.max(rect.width, rect.height)
  const scale = Math.min(Math.max(target / longEdge, 1), MAX_EDGE / longEdge)

  const width = Math.round(rect.width * scale)
  const height = Math.round(rect.height * scale)

  // Canvas matches the region's aspect → exact fit, no letterbox bars.
  const transform = getViewportForBounds(rect, width, height, 0.02, 10, 0)

  const viewport = document.querySelector<HTMLElement>('.react-flow__viewport')
  if (!viewport) throw new Error('ไม่พบพื้นที่กระดาน (viewport)')

  return toPng(viewport, {
    width,
    height,
    // Pin to 1: html-to-image defaults to devicePixelRatio, which doubles the
    // canvas on retina screens — past the ~16k browser limit once the size
    // floor kicks in on a large board (the export comes back blank).
    pixelRatio: 1,
    backgroundColor: opts.transparent ? undefined : LIGHT_BG,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
    },
  })
}

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
  const boardUrl = await renderRegion(paddedBounds(nodes), opts)
  return composeExport(boardUrl, opts, {
    includeBackstory: opts.includeBackstory,
  })
}

/**
 * Render the board as a series of vertical slices sized for Facebook: each
 * image carries ~2000 flow px of story, so cards stay legible after Facebook
 * downsizes to 2048px. Slices overlap slightly so no card is lost on a cut;
 * the title header repeats on every image with a "k/n" marker, and the
 * backstory panel (when requested) rides only on the first.
 */
export async function exportBoardPngSlices(
  nodes: Node[],
  opts: PngOptions,
): Promise<string[]> {
  if (nodes.length === 0) throw new Error('ไม่มีโหนดให้ส่งออก')

  const rect = paddedBounds(nodes)
  const count = Math.max(1, Math.ceil(rect.width / SLICE_TARGET_W))
  if (count === 1) return [await exportBoardPng(nodes, opts)]

  const sliceW = rect.width / count
  const urls: string[] = []
  for (let i = 0; i < count; i++) {
    const x0 = rect.x + i * sliceW - (i > 0 ? SLICE_OVERLAP : 0)
    const x1 = rect.x + (i + 1) * sliceW + (i < count - 1 ? SLICE_OVERLAP : 0)
    const slice: Rect = {
      x: x0,
      y: rect.y,
      width: x1 - x0,
      height: rect.height,
    }
    const boardUrl = await renderRegion(slice, opts)
    urls.push(
      await composeExport(boardUrl, opts, {
        includeBackstory: opts.includeBackstory && i === 0,
        partLabel: `ภาพ ${i + 1}/${count}`,
      }),
    )
  }
  return urls
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

interface ComposeExtras {
  /** Controlled per-image so slice exports can carry backstory only once. */
  includeBackstory: boolean
  /** e.g. "ภาพ 2/3" on slice exports, drawn at the header's right edge. */
  partLabel?: string
}

/**
 * Compose the final image: a title header (always) and — when requested — a
 * distinct sand-panelled Backstory block, stacked above the board so the two
 * read as clearly separate sections.
 */
async function composeExport(
  boardUrl: string,
  opts: PngOptions,
  extras: ComposeExtras,
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
  const backstoryH = extras.includeBackstory
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
  if (extras.partLabel) {
    ctx.font = `600 ${Math.round(22 * scale)}px "Noto Sans Thai", sans-serif`
    const w = ctx.measureText(extras.partLabel).width
    ctx.fillText(extras.partLabel, width - pad - w, Math.round(50 * scale))
  }
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
  if (extras.includeBackstory) {
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
