import { getNodesBounds, getViewportForBounds, type Node } from '@xyflow/react'
import { toPng } from 'html-to-image'
import type { Backstory } from '../domain/types'

export const RESOLUTIONS = {
  '1920x1080': [1920, 1080],
  '2560x1440': [2560, 1440],
  '3840x2160': [3840, 2160],
} as const

export type ResolutionKey = keyof typeof RESOLUTIONS

const LIGHT_BG = '#f8fafc'

export interface PngOptions {
  resolution: ResolutionKey
  transparent: boolean
  includeBackstory: boolean
  backstory: Backstory
  padding?: number
}

/**
 * Render the whole board (including off-screen nodes) to a PNG data URL. The
 * toolbar / drawers live outside `.react-flow__viewport`, so they are never
 * captured.
 */
export async function exportBoardPng(
  nodes: Node[],
  opts: PngOptions,
): Promise<string> {
  const [width, height] = RESOLUTIONS[opts.resolution]
  if (nodes.length === 0) throw new Error('ไม่มีโหนดให้ส่งออก')

  const bounds = getNodesBounds(nodes)
  const padding = opts.padding ?? 0.12
  const transform = getViewportForBounds(bounds, width, height, 0.05, 4, padding)

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

  if (!opts.includeBackstory) return boardUrl
  return composeWithBackstory(boardUrl, opts.backstory, width, opts.transparent)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('โหลดภาพกระดานไม่สำเร็จ'))
    img.src = src
  })
}

/** Draw a header band with the five backstory fields above the board image. */
async function composeWithBackstory(
  boardUrl: string,
  backstory: Backstory,
  width: number,
  transparent: boolean,
): Promise<string> {
  const img = await loadImage(boardUrl)
  const scale = width / 1920
  const bandHeight = Math.round(260 * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = img.height + bandHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return boardUrl

  if (!transparent) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const pad = Math.round(48 * scale)
  ctx.fillStyle = '#0f172a'
  ctx.font = `bold ${Math.round(30 * scale)}px "Noto Sans Thai", sans-serif`
  ctx.fillText('Backstory / Character Arc', pad, Math.round(48 * scale))

  const rows: [string, string][] = [
    ['Ghost', backstory.ghost],
    ['Lie', backstory.lie],
    ['Lie at Work', backstory.lieAtWork],
    ['Want', backstory.want],
    ['Need', backstory.need],
  ]
  ctx.font = `${Math.round(20 * scale)}px "Noto Sans Thai", sans-serif`
  let y = Math.round(88 * scale)
  const lineH = Math.round(34 * scale)
  for (const [label, value] of rows) {
    ctx.fillStyle = '#64748b'
    ctx.fillText(`${label}:`, pad, y)
    ctx.fillStyle = '#0f172a'
    ctx.fillText(truncate(value, 110), pad + Math.round(150 * scale), y)
    y += lineH
  }

  ctx.drawImage(img, 0, bandHeight)
  return canvas.toDataURL('image/png')
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
