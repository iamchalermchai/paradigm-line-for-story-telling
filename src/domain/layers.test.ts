import { describe, expect, it } from 'vitest'
import {
  isLayeredMemory,
  LAYER_SNAP_Y,
  layerForY,
  snapSceneToLayer,
  suggestStoryLayer,
} from './layers'
import type { StoryScene } from './types'

function scene(partial: Partial<StoryScene>): StoryScene {
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
    ...partial,
  }
}

describe('layers', () => {
  it('detects layered-memory structure', () => {
    expect(isLayeredMemory('layered-memory')).toBe(true)
    expect(isLayeredMemory('four-phase')).toBe(false)
  })

  it('suggests GHOST from arc tag', () => {
    const s = scene({ arcRelation: 'ghost' })
    expect(suggestStoryLayer(s).layer).toBe('ghost')
  })

  it('snaps Y to the nearest lane', () => {
    expect(layerForY(-50)).toBe('character')
    expect(snapSceneToLayer({ x: 100, y: -400 }).storyLayer).toBe('meta')
    expect(snapSceneToLayer({ x: 100, y: -400 }).y).toBe(LAYER_SNAP_Y.meta)
  })
})
