import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useInternalNode,
  type EdgeProps,
} from '@xyflow/react'
import { memo } from 'react'
import type { EdgeType } from '../../domain/types'
import { getEdgeParams } from './floating'

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
  source,
  target,
  data,
  label,
  selected,
}: EdgeProps) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  if (!sourceNode || !targetNode) return null

  const edgeType = (data?.edgeType as EdgeType) ?? 'actual_path'
  const style = EDGE_STYLE[edgeType]

  // Floating anchors + a gentle curve = a thread that runs directly between the
  // two cards instead of looping out to fixed handles.
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode,
  )
  const [path, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    curvature: 0.3,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: style.stroke,
          strokeWidth: selected ? 2.5 : 1.6,
          strokeDasharray: style.dashed ? '5 5' : undefined,
          strokeLinecap: 'round',
          opacity: selected ? 1 : 0.85,
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
