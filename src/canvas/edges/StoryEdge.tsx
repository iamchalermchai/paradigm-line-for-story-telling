import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'
import { memo } from 'react'
import type { EdgeType } from '../../domain/types'

interface EdgeStyle {
  stroke: string
  dashed: boolean
}

export const EDGE_STYLE: Record<EdgeType, EdgeStyle> = {
  actual_path: { stroke: '#3d4dec', dashed: false }, // solid indigo
  expected_want_path: { stroke: '#3d4dec', dashed: true }, // dotted indigo
  better_outcome_path: { stroke: '#2f9c6c', dashed: true }, // dotted mint
  failure_path: { stroke: '#cd5042', dashed: true }, // dotted rust
  character_arc: { stroke: '#2f9c6c', dashed: false }, // solid mint
}

function StoryEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  label,
  selected,
}: EdgeProps) {
  const edgeType = (data?.edgeType as EdgeType) ?? 'actual_path'
  const style = EDGE_STYLE[edgeType]
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: style.stroke,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: style.dashed ? '6 4' : undefined,
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute rounded bg-cream/95 px-1.5 py-0.5 text-[10px] text-ink"
            style={{
              border: '1px solid rgba(20,22,25,0.15)',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {String(label)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const StoryEdge = memo(StoryEdgeComponent)
