import { Position, type InternalNode, type Node } from '@xyflow/react'

// Floating-edge geometry: instead of pinning to fixed left/right handles (which
// forces big detours when a target sits above or behind the source), anchor
// each edge to the point on the node's border that faces the other node. The
// result is a short, direct curve between the two cards — the "thread" look.

function getNodeCenterAndSize(node: InternalNode<Node>) {
  const w = node.measured?.width ?? 0
  const h = node.measured?.height ?? 0
  const { x, y } = node.internals.positionAbsolute
  return { cx: x + w / 2, cy: y + h / 2, w, h }
}

/** Point where the line from this node's centre to the other node crosses this node's border. */
function getNodeIntersection(
  node: InternalNode<Node>,
  other: InternalNode<Node>,
): { x: number; y: number } {
  const { cx: x2, cy: y2, w, h } = getNodeCenterAndSize(node)
  const halfW = w / 2
  const halfH = h / 2
  const { cx: x1, cy: y1 } = getNodeCenterAndSize(other)

  if (halfW === 0 || halfH === 0) return { x: x2, y: y2 }

  const xx1 = (x1 - x2) / (2 * halfW) - (y1 - y2) / (2 * halfH)
  const yy1 = (x1 - x2) / (2 * halfW) + (y1 - y2) / (2 * halfH)
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1)
  const xx3 = a * xx1
  const yy3 = a * yy1
  return { x: halfW * (xx3 + yy3) + x2, y: halfH * (-xx3 + yy3) + y2 }
}

/** Which side of the node the intersection sits on (drives the bezier tangent). */
function getEdgePosition(
  node: InternalNode<Node>,
  point: { x: number; y: number },
): Position {
  const { cx, cy, w, h } = getNodeCenterAndSize(node)
  const px = Math.round(point.x)
  const py = Math.round(point.y)
  const left = Math.round(cx - w / 2)
  const right = Math.round(cx + w / 2)
  const top = Math.round(cy - h / 2)
  if (px <= left + 1) return Position.Left
  if (px >= right - 1) return Position.Right
  if (py <= top + 1) return Position.Top
  return Position.Bottom
}

export interface EdgeParams {
  sx: number
  sy: number
  tx: number
  ty: number
  sourcePos: Position
  targetPos: Position
}

export function getEdgeParams(
  source: InternalNode<Node>,
  target: InternalNode<Node>,
): EdgeParams {
  const sourcePoint = getNodeIntersection(source, target)
  const targetPoint = getNodeIntersection(target, source)
  return {
    sx: sourcePoint.x,
    sy: sourcePoint.y,
    tx: targetPoint.x,
    ty: targetPoint.y,
    sourcePos: getEdgePosition(source, sourcePoint),
    targetPos: getEdgePosition(target, targetPoint),
  }
}
