import { describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import {
  BEAT_LINE_Y,
  OUTCOME_NODE_ID,
  phaseForX,
  projectToEdges,
  projectToNodes,
  reconcileDrag,
} from './graph'

describe('phaseForX', () => {
  it('maps x-coordinates to the right phase column', () => {
    expect(phaseForX(0)).toBe('setup')
    expect(phaseForX(699)).toBe('setup')
    expect(phaseForX(700)).toBe('early')
    expect(phaseForX(1400)).toBe('middle')
    expect(phaseForX(2100)).toBe('ending')
    expect(phaseForX(9999)).toBe('ending')
  })

  it('clamps negative x to the first phase', () => {
    expect(phaseForX(-500)).toBe('setup')
  })
})

describe('projectToNodes / projectToEdges', () => {
  it('produces a node per scene and beat plus one outcome node', () => {
    const project = createSeedProject()
    const nodes = projectToNodes(project)
    expect(nodes).toHaveLength(
      project.scenes.length + project.beats.length + 1,
    )
    expect(nodes.some((n) => n.id === OUTCOME_NODE_ID)).toBe(true)
  })

  it('marks locked scenes as not draggable', () => {
    const project = createSeedProject()
    project.scenes[0].locked = true
    const node = projectToNodes(project).find(
      (n) => n.id === project.scenes[0].id,
    )
    expect(node?.draggable).toBe(false)
  })

  it('carries the edge type through to React Flow edges', () => {
    const project = createSeedProject()
    const edges = projectToEdges(project)
    const arc = edges.find((e) => e.id === 'e-arc')
    expect(arc?.type).toBe('character_arc')
  })
})

describe('reconcileDrag', () => {
  it('splits dragged nodes into scene (with phase) and beat updates', () => {
    const sceneIds = new Set(['s1'])
    const beatIds = new Set(['b1'])
    const result = reconcileDrag(
      [
        { id: 's1', position: { x: 1500, y: 100 } },
        { id: 'b1', position: { x: 800, y: -20 } },
        { id: 'unknown', position: { x: 0, y: 0 } },
      ],
      sceneIds,
      beatIds,
    )
    expect(result.scenes).toEqual([
      { id: 's1', position: { x: 1500, y: 100 }, phase: 'middle' },
    ])
    // Beats keep only their x; y is pinned to the paradigm line (BEAT_LINE_Y).
    expect(result.beats).toEqual([
      { id: 'b1', position: { x: 800, y: BEAT_LINE_Y } },
    ])
  })
})
