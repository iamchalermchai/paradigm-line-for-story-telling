/**
 * Shared SVG primitives that mirror the live Plotline Board:
 * cream paper, ink axis, amber/rust/mint beats, indigo StoryEdges.
 */

import type { ReactNode } from 'react'

export const INK = '#141619'
export const INK_SOFT = '#4b4a45'
export const CREAM = '#f8f6f0'
export const SAND = '#ecc68c'
export const AMBER = '#e49c4e'
export const RUST = '#cd5042'
export const INDIGO = '#3d4dec'
export const MINT = '#2f9c6c'

/** Board-sized teaching plate — same cream as the canvas, no illustration chrome. */
export function DiagramCanvas({
  compact,
  className,
  aria,
  children,
}: {
  compact?: boolean
  className?: string
  aria: string
  children: ReactNode
}) {
  return (
    <svg
      viewBox="0 0 720 260"
      width="100%"
      height={compact ? 168 : 236}
      className={className}
      role="img"
      aria-label={aria}
    >
      <rect width="720" height="260" fill={CREAM} />
      {children}
    </svg>
  )
}

/**
 * Phase columns like the board: ink dividers + Trirong headers.
 * Pass `starts` as left-edge fractions (0..1) when bands are unequal
 * (Three Act / Hero’s Journey). Omit for equal splits.
 */
export function PhaseColumns({
  x0,
  width,
  labels,
  starts,
}: {
  x0: number
  width: number
  labels: string[]
  /** Left edge of each band as fraction of width. Defaults to equal. */
  starts?: number[]
}) {
  const n = labels.length
  const edges =
    starts ?? labels.map((_, i) => i / n)
  return (
    <g>
      {labels.map((label, i) => {
        const left = x0 + edges[i]! * width
        const right =
          i < n - 1 ? x0 + edges[i + 1]! * width : x0 + width
        const mid = (left + right) / 2
        return (
          <g key={label}>
            {i > 0 && (
              <line
                x1={left}
                y1={8}
                x2={left}
                y2={252}
                stroke={INK}
                strokeWidth="1.5"
                opacity="0.28"
              />
            )}
            <text
              x={mid}
              y={28}
              textAnchor="middle"
              fill={INK}
              fontFamily="Trirong, serif"
              fontSize={label.length > 16 ? 11 : 13}
              fontWeight="700"
              letterSpacing="0.005em"
            >
              {label}
            </text>
          </g>
        )
      })}
      <line
        x1={x0}
        y1={8}
        x2={x0}
        y2={252}
        stroke={INK}
        strokeWidth="1.5"
        opacity="0.28"
      />
      <line
        x1={x0 + width}
        y1={8}
        x2={x0 + width}
        y2={252}
        stroke={INK}
        strokeWidth="1.5"
        opacity="0.28"
      />
    </g>
  )
}

/** Paradigm Line — 3px ink, same as the board. */
export function AxisLine({ x1, x2, y = 130 }: { x1: number; x2: number; y?: number }) {
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      stroke={INK}
      strokeWidth="3"
      strokeLinecap="butt"
    />
  )
}

function BeatCaption({
  cx,
  y,
  label,
  side = 'below',
}: {
  cx: number
  y: number
  label: string
  side?: 'above' | 'below'
}) {
  return (
    <text
      x={cx}
      y={side === 'below' ? y + 22 : y - 14}
      textAnchor="middle"
      fill={INK}
      fontFamily="Trirong, serif"
      fontSize="10"
      fontWeight="700"
    >
      {label}
    </text>
  )
}

/** Amber filled circle (default beat). */
export function BeatCircle({
  cx,
  label,
  y = 130,
  color = AMBER,
  labelSide = 'below',
}: {
  cx: number
  label: string
  y?: number
  color?: string
  labelSide?: 'above' | 'below'
}) {
  return (
    <g>
      <circle cx={cx} cy={y} r="9" fill={color} />
      <BeatCaption cx={cx} y={y} label={label} side={labelSide} />
    </g>
  )
}

/** Rust filled square (Want / All Is Lost / Reward). */
export function BeatSquare({
  cx,
  label,
  y = 130,
  color = RUST,
  labelSide = 'below',
}: {
  cx: number
  label: string
  y?: number
  color?: string
  labelSide?: 'above' | 'below'
}) {
  return (
    <g>
      <rect x={cx - 9} y={y - 9} width="18" height="18" fill={color} />
      <BeatCaption cx={cx} y={y} label={label} side={labelSide} />
    </g>
  )
}

/** Ink tick bar (Midpoint / Climax / Plot Points). */
export function BeatTick({
  cx,
  label,
  y = 130,
  labelSide = 'below',
}: {
  cx: number
  label: string
  y?: number
  labelSide?: 'above' | 'below'
}) {
  return (
    <g>
      <rect x={cx - 4} y={y - 10} width="8" height="20" fill={INK} />
      <BeatCaption cx={cx} y={y} label={label} side={labelSide} />
    </g>
  )
}

/** Dotted ring — Ghost (rust) or Need (mint). */
export function BeatDotted({
  cx,
  label,
  y = 130,
  color = RUST,
}: {
  cx: number
  label: string
  y?: number
  color?: string
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={y}
        r="11"
        fill={CREAM}
        stroke={color}
        strokeWidth="2"
        strokeDasharray="2.5 2.5"
      />
      <text
        x={cx}
        y={y + 24}
        textAnchor="middle"
        fill={INK}
        fontFamily="Trirong, serif"
        fontSize="10"
        fontWeight="700"
      >
        {label}
      </text>
    </g>
  )
}

/** Indigo/mint StoryEdge-style path. */
export function StoryPath({
  d,
  dashed = false,
  color = INDIGO,
  width = 1.8,
}: {
  d: string
  dashed?: boolean
  color?: string
  width?: number
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? '5 5' : undefined}
      opacity="0.9"
    />
  )
}

/** Quiet path caption — floating text with a cream halo so lines don't strike through glyphs. */
export function PathNote({
  x,
  y,
  children,
  color = INDIGO,
}: {
  x: number
  y: number
  children: string
  color?: string
}) {
  const w = Math.max(40, children.length * 7.2)
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 11}
        width={w}
        height="15"
        rx="2"
        fill={CREAM}
        opacity="0.92"
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fill={color}
        fontFamily="Noto Sans Thai, sans-serif"
        fontSize="10"
        fontWeight="600"
      >
        {children}
      </text>
    </g>
  )
}

/** @deprecated Prefer PathNote — kept for any leftover call sites. */
export function EdgeLabel(props: {
  x: number
  y: number
  children: string
  color?: string
}) {
  return <PathNote {...props} />
}

/** Climax outcome stamp. */
export function OutcomeStamp({
  x,
  y,
  color,
  label,
}: {
  x: number
  y: number
  color: string
  label: string
}) {
  return (
    <g>
      <rect x={x} y={y} width="14" height="14" rx="2" fill={color} />
      <text
        x={x + 20}
        y={y + 11}
        fill={INK}
        fontFamily="Noto Sans Thai, sans-serif"
        fontSize="10"
        fontWeight="600"
      >
        {label}
      </text>
    </g>
  )
}

/** Sand Backstory margin — matches left panel tone. */
export function BackstoryStrip({
  labels = ['Lie at Work', 'Lie', 'Ghost'],
}: {
  labels?: string[]
}) {
  const cy = [78, 130, 182]
  return (
    <g>
      <rect x="0" y="0" width="72" height="260" fill={SAND} opacity="0.45" />
      <line
        x1="72"
        y1="0"
        x2="72"
        y2="260"
        stroke={INK}
        strokeWidth="1"
        opacity="0.18"
      />
      <text
        x="36"
        y="22"
        textAnchor="middle"
        fill={INK}
        fontFamily="Trirong, serif"
        fontSize="11"
        fontWeight="700"
      >
        Backstory
      </text>
      {labels.map((label, i) => (
        <g key={label}>
          <circle
            cx="36"
            cy={cy[i]}
            r="18"
            fill={CREAM}
            stroke={INK}
            strokeWidth="1.5"
            strokeDasharray="2.5 2.5"
            opacity="0.9"
          />
          <text
            x="36"
            y={cy[i] + 3}
            textAnchor="middle"
            fill={INK}
            fontFamily="Noto Sans Thai, sans-serif"
            fontSize="7"
            fontWeight="600"
          >
            {label}
          </text>
        </g>
      ))}
    </g>
  )
}
