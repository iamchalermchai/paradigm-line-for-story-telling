import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo } from 'react'
import { BEAT_LABELS } from '../../domain/types'
import type { StoryBeatType } from '../../domain/types'
import { useUiStore } from '../../store/uiStore'
import type { BeatNodeData } from '../graph'

type MarkerShape = 'tick' | 'square' | 'dotted-circle' | 'circle'

const BEAT_MARKER: Record<StoryBeatType, { shape: MarkerShape; color: string }> = {
  // Structural landmarks: a plain ink tick on the line.
  midpoint: { shape: 'tick', color: 'var(--color-ink)' },
  climax: { shape: 'tick', color: 'var(--color-ink)' },
  // The stated goal gets the same rust square used for "not achieved" —
  // a want is unresolved by definition until the climax.
  want: { shape: 'square', color: 'var(--color-rust)' },
  // A ghost beat is the past intruding on the present.
  ghost: { shape: 'dotted-circle', color: 'var(--color-rust)' },
  // Regular forward-moving plot beats.
  catalyst: { shape: 'circle', color: 'var(--color-amber)' },
  progress: { shape: 'circle', color: 'var(--color-amber)' },
  warning: { shape: 'circle', color: 'var(--color-amber)' },
  low_point: { shape: 'circle', color: 'var(--color-amber)' },
  aha: { shape: 'circle', color: 'var(--color-amber)' },
  choice: { shape: 'circle', color: 'var(--color-amber)' },
  ending: { shape: 'circle', color: 'var(--color-amber)' },
}

// Beats that grow together on hover — Catalyst sets Want in motion, so
// hovering either highlights the causal pair as one gesture.
const BEAT_GROUP: Partial<Record<StoryBeatType, string>> = {
  catalyst: 'catalyst-want',
  want: 'catalyst-want',
}

function Marker({ shape, color }: { shape: MarkerShape; color: string }) {
  if (shape === 'tick') {
    return (
      <span
        className="inline-block"
        style={{ width: 8, height: 20, background: color }}
        aria-hidden
      />
    )
  }
  if (shape === 'square') {
    return (
      <span
        className="inline-block"
        style={{ width: 18, height: 18, background: color }}
        aria-hidden
      />
    )
  }
  if (shape === 'dotted-circle') {
    return (
      <span
        className="inline-block rounded-full bg-cream"
        style={{ width: 22, height: 22, border: `2px dotted ${color}` }}
        aria-hidden
      />
    )
  }
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: 18, height: 18, background: color }}
      aria-hidden
    />
  )
}

function BeatNodeComponent({ data, selected }: NodeProps) {
  const { beat } = data as unknown as BeatNodeData
  const marker = BEAT_MARKER[beat.type]
  const group = BEAT_GROUP[beat.type]
  const hoveredGroup = useUiStore((s) => s.hoveredBeatGroup)
  const setHoveredBeatGroup = useUiStore((s) => s.setHoveredBeatGroup)
  const expanded = group !== undefined && hoveredGroup === group

  return (
    <div
      className="flex flex-col items-center gap-1 transition-transform duration-150 ease-out"
      role="group"
      aria-label={`Story beat: ${BEAT_LABELS[beat.type]}`}
      title={beat.description}
      onMouseEnter={() => group && setHoveredBeatGroup(group)}
      onMouseLeave={() => group && setHoveredBeatGroup(null)}
      style={{
        transform: expanded ? 'scale(1.6)' : 'scale(1)',
        zIndex: expanded ? 20 : undefined,
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-0 !bg-transparent"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-0 !bg-transparent"
      />
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 24,
          height: 24,
          outline: selected ? '2px solid var(--color-ink)' : undefined,
          outlineOffset: 2,
        }}
      >
        <Marker shape={marker.shape} color={marker.color} />
      </div>
      <span className="font-display whitespace-nowrap text-sm font-bold text-ink">
        {BEAT_LABELS[beat.type]}
      </span>
    </div>
  )
}

export const BeatNode = memo(BeatNodeComponent)
