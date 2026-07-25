import { useId } from 'react'
import {
  LAYER_COLORS,
  LAYER_DESCRIPTIONS,
  LAYER_LABELS,
  STORY_LAYERS,
  sceneDiagramX,
} from '../domain/layers'
import { ARC_RELATION_LABELS } from '../domain/types'
import type { StoryLayer, StoryScene } from '../domain/types'

const CREAM = '#f8f6f0'
const INK = '#141619'
/** Horizontal margin so first/last labels are not clipped by SVG or row clip. */
const LABEL_EDGE_PAD = 80

/** Shared row heights — sidebar grid and SVG bands use the same values. */
const LAYER_ROW_HEIGHT: Record<StoryLayer, number> = {
  meta: 96,
  character: 124,
  memory: 104,
  ghost: 112,
}

/** Node sits low in rows with labels above; high in rows with labels below. */
const LAYER_NODE_ANCHOR: Record<StoryLayer, number> = {
  meta: 0.74,
  character: 0.74,
  memory: 0.3,
  ghost: 0.3,
}

const LAYER_BAND_TINT: Record<StoryLayer, string> = {
  meta: 'rgba(20,22,25,0.045)',
  character: 'rgba(61,77,236,0.06)',
  memory: 'rgba(47,156,108,0.07)',
  ghost: 'rgba(205,80,66,0.07)',
}

type DiagramLayout = {
  bandW: number
  xMin: number
  xMax: number
  edgePad: number
  metaY: number
  spineY: number
  memoryY: number
  ghostY: number
  rowTops: Record<StoryLayer, number>
  height: number
  nodeR: number
}

const MINI_LAYOUT: DiagramLayout = {
  bandW: 228,
  xMin: 58,
  xMax: 218,
  edgePad: 6,
  metaY: 22,
  spineY: 52,
  memoryY: 82,
  ghostY: 112,
  rowTops: { meta: 8, character: 36, memory: 66, ghost: 96 },
  height: 132,
  nodeR: 6,
}

function buildLayout(sceneCount: number): DiagramLayout {
  const timelineW = Math.max(480, sceneCount * 96)
  const bandW = timelineW + LABEL_EDGE_PAD * 2
  const xMin = LABEL_EDGE_PAD + 20
  const xMax = bandW - LABEL_EDGE_PAD - 20

  let top = 0
  const rowTops = {} as Record<StoryLayer, number>
  const centers = {} as Record<StoryLayer, number>

  for (const layer of STORY_LAYERS) {
    rowTops[layer] = top
    centers[layer] =
      top + LAYER_ROW_HEIGHT[layer] * LAYER_NODE_ANCHOR[layer]
    top += LAYER_ROW_HEIGHT[layer]
  }

  return {
    bandW,
    xMin,
    xMax,
    edgePad: 8,
    metaY: centers.meta,
    spineY: centers.character,
    memoryY: centers.memory,
    ghostY: centers.ghost,
    rowTops,
    height: top,
    nodeR: 9,
  }
}

function layerY(layer: StoryLayer, layout: DiagramLayout): number {
  switch (layer) {
    case 'meta':
      return layout.metaY
    case 'character':
      return layout.spineY
    case 'memory':
      return layout.memoryY
    case 'ghost':
      return layout.ghostY
  }
}

function scenesByX(scenes: StoryScene[]): StoryScene[] {
  return [...scenes].sort((a, b) => a.position.x - b.position.x)
}

function nearestSpineX(
  scene: StoryScene,
  scenes: StoryScene[],
  layout: DiagramLayout,
): number {
  const sx = sceneDiagramX(scene, scenes, layout.xMin, layout.xMax)
  const anchors = scenes.filter(
    (s) => s.storyLayer === 'character' || s.storyLayer === 'meta',
  )
  if (anchors.length === 0) return sx
  let best = anchors[0]
  let bestDist = Infinity
  for (const a of anchors) {
    const ax = sceneDiagramX(a, scenes, layout.xMin, layout.xMax)
    const d = Math.abs(ax - sx)
    if (d < bestDist) {
      bestDist = d
      best = a
    }
  }
  return sceneDiagramX(best, scenes, layout.xMin, layout.xMax)
}

function labelSlotWidths(
  scenes: StoryScene[],
  layout: DiagramLayout,
): Map<string, number> {
  const sorted = scenesByX(scenes)
  const widths = new Map<string, number>()
  const { edgePad, bandW } = layout

  for (let i = 0; i < sorted.length; i++) {
    const x = sceneDiagramX(sorted[i], scenes, layout.xMin, layout.xMax)
    const leftRoom = x - edgePad
    const rightRoom = bandW - edgePad - x
    const centered = 2 * Math.min(leftRoom, rightRoom)
    widths.set(sorted[i].id, Math.max(76, Math.min(124, centered)))
  }

  return widths
}

function TriggerLine({
  x1,
  y1,
  x2,
  y2,
  dashed,
  color = INK,
  strokeWidth = 1.25,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  dashed?: boolean
  color?: string
  strokeWidth?: number
}) {
  return (
    <path
      d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      opacity={dashed ? 0.45 : 0.55}
      strokeDasharray={dashed ? '5 4' : undefined}
    />
  )
}

function NodeCaption({
  x,
  cy,
  r,
  text,
  placement,
  maxWidth,
  rowTop,
  rowHeight,
  canvasW,
  edgePad = 8,
  fontSize = 10,
  maxLines = 3,
}: {
  x: number
  cy: number
  r: number
  text: string
  placement: 'above' | 'below'
  maxWidth: number
  rowTop: number
  rowHeight: number
  canvasW: number
  edgePad?: number
  fontSize?: number
  maxLines?: number
}) {
  const lineHeight = 1.42
  const pad = 5
  const boxH = Math.ceil(fontSize * lineHeight * maxLines) + 6
  const boxW = maxWidth

  let boxY =
    placement === 'above'
      ? cy - r - pad - boxH
      : cy + r + pad

  if (placement === 'above') {
    boxY = Math.max(rowTop + 2, boxY)
  } else {
    boxY = Math.min(boxY, rowTop + rowHeight - boxH - 2)
  }

  let boxX = x - boxW / 2
  boxX = Math.max(edgePad, boxX)
  boxX = Math.min(boxX, canvasW - edgePad - boxW)

  return (
    <foreignObject
      x={boxX}
      y={boxY}
      width={boxW}
      height={boxH}
    >
      <div
        {...{ xmlns: 'http://www.w3.org/1999/xhtml' }}
        style={{
          margin: 0,
          fontFamily: 'Noto Sans Thai, sans-serif',
          fontSize: `${fontSize}px`,
          fontWeight: 600,
          lineHeight: lineHeight,
          textAlign: 'center',
          color: INK,
          wordBreak: 'normal',
          overflowWrap: 'break-word',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {text}
      </div>
    </foreignObject>
  )
}

function LayerSidebarRow({
  layer,
  count,
  visible,
  isLast,
}: {
  layer: StoryLayer
  count: number
  visible: boolean
  isLast?: boolean
}) {
  const color = LAYER_COLORS[layer]

  return (
    <div
      className="relative flex flex-col justify-center py-2 pl-3 pr-4"
      style={{
        height: LAYER_ROW_HEIGHT[layer],
        opacity: visible ? 1 : 0.38,
        borderBottom: isLast ? undefined : '1px solid rgba(20,22,25,0.08)',
        background: LAYER_BAND_TINT[layer],
      }}
    >
      <span
        className="absolute top-3 bottom-3 left-0 w-[3px] rounded-r-sm"
        style={{ background: color }}
        aria-hidden
      />
      <p
        className="font-display pl-1.5 text-[11px] font-bold tracking-wide"
        style={{ color }}
      >
        {LAYER_LABELS[layer]}
      </p>
      <p className="mt-1.5 pl-1.5 text-[10px] leading-[1.45] text-ink/62">
        {LAYER_DESCRIPTIONS[layer]}
      </p>
      {count > 0 && (
        <p className="mt-1.5 pl-1.5 text-[9px] font-semibold text-ink/38">
          {count} ฉาก
        </p>
      )}
    </div>
  )
}

function FullLayerCanvas({
  scenes,
  visible,
  layout,
}: {
  scenes: StoryScene[]
  visible: Record<StoryLayer, boolean>
  layout: DiagramLayout
}) {
  const clipPrefix = useId().replace(/:/g, '')
  const visibleScenes = scenes.filter((s) => visible[s.storyLayer])
  const slotWidths = labelSlotWidths(visibleScenes, layout)

  const triggers = visibleScenes.flatMap((s) => {
    if (s.storyLayer !== 'memory' && s.storyLayer !== 'ghost') return []
    const x = sceneDiagramX(s, scenes, layout.xMin, layout.xMax)
    const y = layerY(s.storyLayer, layout)
    const ax = nearestSpineX(s, scenes, layout)
    return [
      {
        key: `t-${s.id}`,
        x1: ax,
        y1: layout.spineY,
        x2: x,
        y2: y,
        dashed: s.storyLayer === 'ghost',
        color: LAYER_COLORS[s.storyLayer],
      },
    ]
  })

  return (
    <div className="relative min-w-0 overflow-x-auto py-0.5">
      <svg
        viewBox={`0 0 ${layout.bandW} ${layout.height}`}
        width={layout.bandW}
        height={layout.height}
        className="block"
        role="img"
        aria-label="ไทม์ไลน์มิติของเรื่อง"
        style={{ background: CREAM, minWidth: '100%' }}
      >
        <defs>
          {STORY_LAYERS.map((layer) => (
            <clipPath key={layer} id={`${clipPrefix}-row-${layer}`}>
              <rect
                x={-LABEL_EDGE_PAD}
                y={layout.rowTops[layer]}
                width={layout.bandW + LABEL_EDGE_PAD * 2}
                height={LAYER_ROW_HEIGHT[layer]}
              />
            </clipPath>
          ))}
        </defs>

        {STORY_LAYERS.map((layer, i) => {
          if (i === 0) return null
          const y = layout.rowTops[layer]
          return (
            <line
              key={`div-${layer}`}
              x1={0}
              y1={y}
              x2={layout.bandW}
              y2={y}
              stroke={INK}
              strokeWidth={1}
              strokeDasharray="6 5"
              opacity={0.16}
            />
          )
        })}

        {STORY_LAYERS.map((layer) =>
          visible[layer] ? (
            <rect
              key={`band-${layer}`}
              x={0}
              y={layout.rowTops[layer]}
              width={layout.bandW}
              height={LAYER_ROW_HEIGHT[layer]}
              fill={LAYER_BAND_TINT[layer]}
            />
          ) : null,
        )}

        {visible.character && (
          <line
            x1={12}
            y1={layout.spineY}
            x2={layout.bandW - 12}
            y2={layout.spineY}
            stroke={LAYER_COLORS.character}
            strokeWidth={3.5}
            opacity={0.92}
            strokeLinecap="round"
          />
        )}

        {triggers.map(({ key, ...t }) => (
          <TriggerLine key={key} {...t} strokeWidth={1.5} />
        ))}

        {visibleScenes.map((s, _i, all) => {
          const x = sceneDiagramX(s, all, layout.xMin, layout.xMax)
          const y = layerY(s.storyLayer, layout)
          const isCircle =
            s.storyLayer === 'meta' || s.storyLayer === 'character'
          const r = layout.nodeR
          const placement =
            s.storyLayer === 'meta' || s.storyLayer === 'character'
              ? 'above'
              : 'below'
          const rowTop = layout.rowTops[s.storyLayer]

          return (
            <g key={s.id}>
              {isCircle ? (
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={LAYER_COLORS[s.storyLayer]}
                  stroke={CREAM}
                  strokeWidth={2}
                />
              ) : (
                <path
                  d={`M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`}
                  fill={LAYER_COLORS[s.storyLayer]}
                  stroke={CREAM}
                  strokeWidth={2}
                />
              )}
              <g clipPath={`url(#${clipPrefix}-row-${s.storyLayer})`}>
                <NodeCaption
                  x={x}
                  cy={y}
                  r={r}
                  text={s.title}
                  placement={placement}
                  maxWidth={slotWidths.get(s.id) ?? 96}
                  rowTop={rowTop}
                  rowHeight={LAYER_ROW_HEIGHT[s.storyLayer]}
                  canvasW={layout.bandW}
                  edgePad={layout.edgePad}
                />
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Compact list for the bookmark rail (mini view only). */
export function LayerDiagramLegend({
  scenes,
  visible,
}: {
  scenes: StoryScene[]
  visible?: Record<StoryLayer, boolean>
}) {
  const show =
    visible ??
    (Object.fromEntries(STORY_LAYERS.map((l) => [l, true])) as Record<
      StoryLayer,
      boolean
    >)
  const ordered = scenesByX(scenes).filter((s) => show[s.storyLayer])

  if (ordered.length === 0) return null

  return (
    <ol
      className="mt-2 max-h-36 space-y-1 overflow-y-auto text-[10px] leading-snug text-ink/70"
      aria-label="รายการฉากตามลำดับเวลา"
    >
      {ordered.map((s, i) => (
        <li key={s.id} className="flex flex-wrap items-baseline gap-x-1">
          <span className="text-ink/40">{i + 1}.</span>
          <span className="font-medium text-ink">{s.title}</span>
          <span className="text-ink/40">
            · {LAYER_LABELS[s.storyLayer]} · {ARC_RELATION_LABELS[s.arcRelation]}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function LayerDiagram({
  scenes,
  size = 'mini',
  visible,
  onExpand,
}: {
  scenes: StoryScene[]
  size?: 'mini' | 'full'
  visible?: Record<StoryLayer, boolean>
  onExpand?: () => void
}) {
  const show =
    visible ??
    (Object.fromEntries(STORY_LAYERS.map((l) => [l, true])) as Record<
      StoryLayer,
      boolean
    >)
  const counts = STORY_LAYERS.reduce(
    (acc, l) => {
      acc[l] = scenes.filter((s) => s.storyLayer === l).length
      return acc
    },
    {} as Record<StoryLayer, number>,
  )

  if (size === 'full') {
    const visibleScenes = scenes.filter((s) => show[s.storyLayer])
    const layout = buildLayout(Math.max(visibleScenes.length, 1))

    return (
      <div
        className="overflow-hidden rounded-sm"
        style={{
          border: '1px solid rgba(20,22,25,0.14)',
          background: CREAM,
        }}
      >
        <div
          className="grid min-w-0"
          style={{
            gridTemplateColumns: 'minmax(204px, 228px) 1fr',
            gridTemplateRows: STORY_LAYERS.map((l) => `${LAYER_ROW_HEIGHT[l]}px`).join(
              ' ',
            ),
          }}
        >
          {STORY_LAYERS.map((layer, i) => (
            <LayerSidebarRow
              key={layer}
              layer={layer}
              count={counts[layer]}
              visible={show[layer]}
              isLast={i === STORY_LAYERS.length - 1}
            />
          ))}
          <div className="col-start-2 row-span-4 row-start-1 min-w-0">
            <FullLayerCanvas scenes={scenes} visible={show} layout={layout} />
          </div>
        </div>
      </div>
    )
  }

  const layout = MINI_LAYOUT

  const triggers = scenes.flatMap((s) => {
    if (!show[s.storyLayer]) return []
    if (s.storyLayer !== 'memory' && s.storyLayer !== 'ghost') return []
    const x = sceneDiagramX(s, scenes, layout.xMin, layout.xMax)
    const y = layerY(s.storyLayer, layout)
    const ax = nearestSpineX(s, scenes, layout)
    return [
      {
        key: `t-${s.id}`,
        x1: ax,
        y1: layout.spineY,
        x2: x,
        y2: y,
        dashed: s.storyLayer === 'ghost',
        color: LAYER_COLORS[s.storyLayer],
      },
    ]
  })

  const svg = (
    <svg
      viewBox={`0 0 276 ${layout.height}`}
      width="100%"
      className="block rounded-sm"
      role="img"
      aria-label="ภาพมิติของเรื่องเล่า"
      style={{
        border: '1px solid rgba(20,22,25,0.14)',
        background: CREAM,
      }}
    >
      {show.meta && (
        <rect
          x={4}
          y={8}
          width={268}
          height={24}
          fill={LAYER_BAND_TINT.meta}
          rx={2}
        />
      )}

      {show.character && (
        <line
          x1={42}
          y1={layout.spineY}
          x2={234}
          y2={layout.spineY}
          stroke={LAYER_COLORS.character}
          strokeWidth={2}
          opacity={0.9}
        />
      )}

      {triggers.map(({ key, ...t }) => (
        <TriggerLine key={key} {...t} strokeWidth={1.1} />
      ))}

      {scenes.map((s, _i, all) => {
        if (!show[s.storyLayer]) return null
        const x = sceneDiagramX(s, all, layout.xMin, layout.xMax)
        const y = layerY(s.storyLayer, layout)
        const isCircle = s.storyLayer === 'meta' || s.storyLayer === 'character'
        const r = layout.nodeR
        const placement =
          s.storyLayer === 'meta' || s.storyLayer === 'character'
            ? 'above'
            : 'below'

        return (
          <g key={s.id}>
            {isCircle ? (
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={LAYER_COLORS[s.storyLayer]}
                stroke={CREAM}
                strokeWidth={1}
              >
                <title>{s.title}</title>
              </circle>
            ) : (
              <path
                d={`M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`}
                fill={LAYER_COLORS[s.storyLayer]}
                stroke={CREAM}
                strokeWidth={1}
              >
                <title>{s.title}</title>
              </path>
            )}
            <NodeCaption
              x={x}
              cy={y}
              r={r}
              text={s.title}
              placement={placement}
              maxWidth={56}
              rowTop={layout.rowTops[s.storyLayer] ?? 0}
              rowHeight={28}
              canvasW={layout.bandW}
              edgePad={layout.edgePad}
              fontSize={6.5}
              maxLines={2}
            />
          </g>
        )
      })}
    </svg>
  )

  if (onExpand) {
    return (
      <button
        type="button"
        className="w-full cursor-pointer rounded-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo"
        aria-label="ขยายภาพมิติ"
        onClick={onExpand}
      >
        {svg}
      </button>
    )
  }

  return svg
}
