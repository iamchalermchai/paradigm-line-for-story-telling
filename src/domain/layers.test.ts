import { describe, expect, it } from 'vitest'
import { createSeedProject } from './seed'
import { isLaneMode, snapSceneToLayer, suggestStoryLayer } from './layers'
import type { StoryScene } from './types'

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

describe('lane mode', () => {
  it('isLaneMode reflects the project flag', () => {
    expect(isLaneMode(true)).toBe(true)
    expect(isLaneMode(false)).toBe(false)
  })

  it('suggests ghost layer from arc tag', () => {
    const s = suggestStoryLayer(scene({ arcRelation: 'ghost' }))
    expect(s.layer).toBe('ghost')
  })

  it('snaps Y to lane', () => {
    expect(snapSceneToLayer({ x: 100, y: -400 }).storyLayer).toBe('meta')
  })

  it('seed project defaults lane mode off', () => {
    expect(createSeedProject().laneMode).toBe(false)
  })
})
