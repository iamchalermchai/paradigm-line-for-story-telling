import { describe, expect, it } from 'vitest'
import { createSeedProject } from './seed'
import { isLaneMode, snapSceneToLayer, suggestStoryLayer } from './layers'
import type { StoryScene } from './types'
import { useProjectStore } from '../store/projectStore'

function scene(overrides: Partial<StoryScene> = {}): StoryScene {
  return {
    id: 's1',
    title: 'ทดสอบ',
    location: '',
    characters: [],
    characterGoal: '',
    action: '',
    obstacle: '',
    internalConflict: '',
    outcome: '',
    changeAfterScene: '',
    phase: 'setup',
    arcRelation: 'neutral',
    storyLayer: 'character',
    position: { x: 0, y: 0 },
    order: 0,
    notes: '',
    collapsed: false,
    locked: false,
    ...overrides,
  }
}

describe('suggestStoryLayer', () => {
  it('ghost arc alone suggests CHARACTER on the spine', () => {
    const s = suggestStoryLayer(scene({ arcRelation: 'ghost' }))
    expect(s.layer).toBe('character')
    expect(s.reason).toContain('Ghost')
    expect(s.arcNote).toBeTruthy()
  })

  it('ghost arc + flashback text suggests MEMORY', () => {
    const s = suggestStoryLayer(
      scene({ arcRelation: 'ghost', action: 'ย้อนคิดวัยเด็ก' }),
    )
    expect(s.layer).toBe('memory')
  })

  it('ghost arc + haunt text suggests GHOST layer', () => {
    const s = suggestStoryLayer(
      scene({
        arcRelation: 'ghost',
        internalConflict: 'แผลเก่าหลอกหลอน',
      }),
    )
    expect(s.layer).toBe('ghost')
  })

  it('want arc suggests CHARACTER from arc tag', () => {
    const s = suggestStoryLayer(scene({ arcRelation: 'want' }))
    expect(s.layer).toBe('character')
    expect(s.reason).toContain('Want')
  })
})

describe('lane mode', () => {
  it('isLaneMode reflects the project flag', () => {
    expect(isLaneMode(true)).toBe(true)
    expect(isLaneMode(false)).toBe(false)
  })

  it('snapSceneToLayer maps Y to layer without moving x', () => {
    const snap = snapSceneToLayer({ x: 100, y: -400 })
    expect(snap.storyLayer).toBe('meta')
    expect(snap.x).toBe(100)
  })

  it('seed project defaults lane mode off', () => {
    expect(createSeedProject().laneMode).toBe(false)
  })
})

describe('setLaneMode', () => {
  it('does not move scene positions when enabled', () => {
    localStorage.clear()
    useProjectStore.getState().importProject(createSeedProject())
    const before = useProjectStore.getState().project.scenes.map((s) => ({
      id: s.id,
      y: s.position.y,
    }))
    useProjectStore.getState().setLaneMode(true)
    const after = useProjectStore.getState().project.scenes.map((s) => ({
      id: s.id,
      y: s.position.y,
    }))
    expect(after).toEqual(before)
  })
})

describe('applyLayerSuggestions', () => {
  it('updates storyLayer only, not position', () => {
    localStorage.clear()
    useProjectStore.getState().importProject(createSeedProject())
    const target = useProjectStore.getState().project.scenes[0]
    const yBefore = target.position.y
    useProjectStore.getState().applyLayerSuggestions([
      { id: target.id, storyLayer: 'memory' },
    ])
    const updated = useProjectStore.getState().project.scenes.find(
      (s) => s.id === target.id,
    )
    expect(updated?.storyLayer).toBe('memory')
    expect(updated?.position.y).toBe(yBefore)
  })
})
