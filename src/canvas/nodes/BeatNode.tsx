import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo } from 'react'
import {
  findBeatAnywhere,
  getStructureTemplate,
  type BeatShape,
} from '../../domain/structure'
import { useProjectStore } from '../../store/projectStore'
import { useUiStore } from '../../store/uiStore'
import type { BeatNodeData } from '../graph'

// Fallback for a marker no structure defines (hand-added, or a key from a
// project saved by a newer version): a quiet amber dot.
const UNKNOWN_MARKER = { shape: 'circle' as BeatShape, color: 'var(--color-amber)' }

function Marker({ shape, color }: { shape: BeatShape; color: string }) {
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
  const structureId = useProjectStore((s) => s.project.structureTemplateId)
  const definition = findBeatAnywhere(
    beat.type,
    getStructureTemplate(structureId),
  )
  const marker = definition ?? UNKNOWN_MARKER
  const label = definition?.label ?? beat.title
  const group = definition?.group
  const hoveredGroup = useUiStore((s) => s.hoveredBeatGroup)
  const setHoveredBeatGroup = useUiStore((s) => s.setHoveredBeatGroup)
  const expanded = group !== undefined && hoveredGroup === group

  return (
    <div
      className="flex flex-col items-center gap-1 transition-transform duration-150 ease-out"
      role="group"
      aria-label={`Story beat: ${label}`}
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
      {/* Dense sheets (Save the Cat) stagger every other label onto a lower row
          so neighbouring names do not collide on the line. */}
      <span
        className="font-display whitespace-nowrap text-sm font-bold text-ink"
        style={definition?.tier === 1 ? { marginTop: 20 } : undefined}
      >
        {label}
      </span>
    </div>
  )
}

export const BeatNode = memo(BeatNodeComponent)
