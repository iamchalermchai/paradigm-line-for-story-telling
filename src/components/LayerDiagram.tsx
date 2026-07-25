import {
  LAYER_COLORS,
  LAYER_HINTS,
  LAYER_LABELS,
  LAYER_SNAP_Y,
  STORY_LAYERS,
  sceneDiagramX,
} from '../domain/layers'
import type { StoryLayer, StoryScene } from '../domain/types'

const CREAM = '#f8f6f0'
const INK = '#141619'

const FULL_LANE_Y: Record<StoryLayer, number> = {
  meta: 48,
  character: 118,
  memory: 188,
  ghost: 258,
}

const MINI_LANE_Y: Record<StoryLayer, number> = {
  meta: 22,
  character: 52,
  memory: 82,
  ghost: 112,
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
  const show = visible ?? Object.fromEntries(STORY_LAYERS.map((l) => [l, true])) as Record<
    StoryLayer,
    boolean
  >
  const counts = STORY_LAYERS.reduce(
    (acc, l) => {
      acc[l] = scenes.filter((s) => s.storyLayer === l).length
      return acc
    },
    {} as Record<StoryLayer, number>,
  )

  const laneY = size === 'full' ? FULL_LANE_Y : MINI_LANE_Y
  const xMin = size === 'full' ? 120 : 50
  const xMax = size === 'full' ? 620 : 230

  const svg = (
    <svg
      viewBox={size === 'full' ? '0 0 720 300' : '0 0 276 132'}
      width="100%"
      className={size === 'mini' ? 'block rounded' : 'block'}
      role="img"
      aria-label={size === 'full' ? 'ภาพเลนสี่ชั้นขยาย' : 'ภาพเลนสี่ชั้น'}
      style={
        size === 'mini'
          ? {
              border: '1px solid rgba(20,22,25,0.14)',
              background: CREAM,
            }
          : undefined
      }
    >
      {size === 'full' && <rect width="720" height="300" fill={CREAM} />}

      {STORY_LAYERS.map((layer, i) => {
        const y = laneY[layer]
        const lit = show[layer]
        const bandX = size === 'full' ? 88 : 42
        const bandW = size === 'full' ? 620 : 228
        return (
          <g key={layer} opacity={lit ? 1 : size === 'full' ? 0.2 : 0.22}>
            <rect
              x={bandX}
              y={y - (size === 'full' ? 28 : 13)}
              width={bandW}
              height={size === 'full' ? 56 : 26}
              fill={
                i % 2 === 0
                  ? 'rgba(20,22,25,0.04)'
                  : `${LAYER_COLORS[layer]}${size === 'full' ? '10' : '0c'}`
              }
            />
            <line
              x1={bandX}
              y1={y}
              x2={bandX + bandW}
              y2={y}
              stroke={LAYER_COLORS[layer]}
              strokeWidth={layer === 'character' ? (size === 'full' ? 2.5 : 2) : 1}
              opacity={layer === 'character' ? 0.85 : 0.4}
            />
            <text
              x={size === 'full' ? 12 : 4}
              y={y + (size === 'full' ? -4 : 1)}
              fill={LAYER_COLORS[layer]}
              fontFamily="Trirong, serif"
              fontSize={size === 'full' ? 11 : 8}
              fontWeight="700"
            >
              {size === 'full' ? LAYER_LABELS[layer] : LAYER_LABELS[layer].slice(0, 4)}
            </text>
            {size === 'full' && (
              <text
                x="12"
                y={y + 12}
                fill={INK}
                fontFamily="Noto Sans Thai, sans-serif"
                fontSize="8"
                opacity="0.5"
              >
                {LAYER_HINTS[layer]} · ×{counts[layer]}
              </text>
            )}
            {size === 'mini' && (
              <text
                x="4"
                y={y + 10}
                fill={INK}
                fontFamily="Noto Sans Thai, sans-serif"
                fontSize="6"
                opacity="0.45"
              >
                ×{counts[layer]}
              </text>
            )}
          </g>
        )
      })}

      {scenes.map((s, _i, all) => {
        if (!show[s.storyLayer]) return null
        const x = sceneDiagramX(s, all, xMin, xMax)
        const y = laneY[s.storyLayer]
        const isCircle = s.storyLayer === 'meta' || s.storyLayer === 'character'
        const r = size === 'full' ? 9 : 6
        const above = isCircle
        const label =
          size === 'mini' && s.title.length > 8
            ? `${s.title.slice(0, 7)}…`
            : s.title
        const labelY = above ? y - r - (size === 'full' ? 8 : 10) : y + r + (size === 'full' ? 14 : 12)

        return (
          <g key={s.id}>
            {isCircle ? (
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={LAYER_COLORS[s.storyLayer]}
                stroke={CREAM}
                strokeWidth={size === 'full' ? 1.5 : 1}
              />
            ) : (
              <path
                d={`M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`}
                fill={LAYER_COLORS[s.storyLayer]}
                stroke={CREAM}
                strokeWidth={size === 'full' ? 1.5 : 1}
              />
            )}
            <text
              x={x}
              y={labelY}
              textAnchor="middle"
              fill={INK}
              stroke={CREAM}
              strokeWidth={size === 'full' ? 4 : 2.5}
              paintOrder="stroke"
              fontFamily="Noto Sans Thai, sans-serif"
              fontSize={size === 'full' ? 10 : 6.5}
              fontWeight="600"
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )

  if (onExpand) {
    return (
      <button
        type="button"
        className="w-full cursor-pointer rounded transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2b7a8c]"
        aria-label="ขยายภาพเลน"
        onClick={onExpand}
      >
        {svg}
      </button>
    )
  }

  return svg
}

/** Snap Y constants for editor / drag (re-export for convenience). */
export { LAYER_SNAP_Y }
