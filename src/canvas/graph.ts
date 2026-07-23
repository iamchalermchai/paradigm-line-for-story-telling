import { PHASE_WIDTH } from '../domain/seed'
import { PARADIGM_LINE_Y, STORY_PHASES } from '../domain/types'
import type {
  BeatMarker,
  Project,
  StoryEdge,
  StoryPhase,
  StoryScene,
} from '../domain/types'
import type { Edge, Node } from '@xyflow/react'

/** Beat markers ride the paradigm line: this is their fixed y. */
export const BEAT_LINE_Y = PARADIGM_LINE_Y - 12

export type SceneNodeData = { scene: StoryScene }
export type BeatNodeData = { beat: BeatMarker }
export type OutcomeNodeData = { project: Project }

export type BoardNode =
  | (Node<SceneNodeData> & { type: 'scene' })
  | (Node<BeatNodeData> & { type: 'beat' })
  | (Node<OutcomeNodeData> & { type: 'outcome' })

export const OUTCOME_NODE_ID = 'outcome-node'

/** Which phase column an x-coordinate falls into (clamped to the board). */
export function phaseForX(x: number): StoryPhase {
  const index = Math.floor(x / PHASE_WIDTH)
  const clamped = Math.max(0, Math.min(STORY_PHASES.length - 1, index))
  return STORY_PHASES[clamped]
}

export function sceneToNode(scene: StoryScene): BoardNode {
  return {
    id: scene.id,
    type: 'scene',
    position: scene.position,
    data: { scene },
    draggable: !scene.locked,
    selectable: true,
  }
}

export function beatToNode(beat: BeatMarker): BoardNode {
  return {
    id: beat.id,
    type: 'beat',
    position: beat.position,
    data: { beat },
    draggable: !beat.locked,
    selectable: true,
  }
}

/**
 * Position of the outcome node: to the right of the last phase column, centred
 * on the paradigm line.
 */
export function outcomeNodePosition(): { x: number; y: number } {
  return { x: STORY_PHASES.length * PHASE_WIDTH + 40, y: -80 }
}

export function projectToNodes(project: Project): BoardNode[] {
  const sceneNodes = project.scenes.map(sceneToNode)
  const beatNodes = project.beats.map(beatToNode)
  const outcome: BoardNode = {
    id: OUTCOME_NODE_ID,
    type: 'outcome',
    position: outcomeNodePosition(),
    data: { project },
    draggable: false,
    selectable: false,
    deletable: false,
  }
  return [...beatNodes, ...sceneNodes, outcome]
}

export function edgeToRf(edge: StoryEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
    type: edge.type,
    label: edge.label,
    data: { edgeType: edge.type },
  }
}

export function projectToEdges(project: Project): Edge[] {
  return project.edges.map(edgeToRf)
}

export interface DragResult {
  scenes: { id: string; position: { x: number; y: number }; phase: StoryPhase }[]
  beats: { id: string; position: { x: number; y: number } }[]
}

/**
 * Given the nodes that finished dragging, split them into scene updates
 * (with recomputed phase) and beat updates. `sceneIds`/`beatIds` identify the
 * kind of each node.
 */
export function reconcileDrag(
  dragged: { id: string; position: { x: number; y: number } }[],
  sceneIds: Set<string>,
  beatIds: Set<string>,
): DragResult {
  const scenes: DragResult['scenes'] = []
  const beats: DragResult['beats'] = []
  for (const node of dragged) {
    if (sceneIds.has(node.id)) {
      scenes.push({
        id: node.id,
        position: node.position,
        phase: phaseForX(node.position.x),
      })
    } else if (beatIds.has(node.id)) {
      // Beats only move horizontally — pin them to the paradigm line.
      beats.push({
        id: node.id,
        position: { x: node.position.x, y: BEAT_LINE_Y },
      })
    }
  }
  return { scenes, beats }
}
