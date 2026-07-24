import { describe, expect, it } from 'vitest'
import { createSeedProject } from './seed'
import { hasTellingOrder, tellingChapters, TELLING_LETTERS } from './telling'
import type { StoryScene } from './types'

function scene(id: string, chapter?: string): StoryScene {
  return {
    id,
    title: id,
    location: '',
    characters: [],
    characterGoal: '',
    action: '',
    obstacle: '',
    outcome: '',
    changeAfterScene: '',
    phase: 'setup',
    arcRelation: 'neutral',
    tellingChapter: chapter,
    position: { x: 0, y: 0 },
    order: 0,
    notes: '',
    collapsed: false,
    locked: false,
  }
}

describe('telling chapters', () => {
  it('groups scenes by chapter, ordered A→B→C, dropping unassigned', () => {
    const scenes = [
      scene('s1', 'B'),
      scene('s2', 'A'),
      scene('s3', 'B'),
      scene('s4'), // unassigned
    ]
    const chapters = tellingChapters(scenes)
    expect(chapters.map((c) => c.letter)).toEqual(['A', 'B'])
    expect(chapters[1].scenes.map((s) => s.id)).toEqual(['s1', 's3'])
  })

  it('hasTellingOrder reflects whether any scene is assigned', () => {
    expect(hasTellingOrder([scene('a')])).toBe(false)
    expect(hasTellingOrder([scene('a', 'A')])).toBe(true)
  })

  it('the seed project ships a non-linear telling starting at chapter A', () => {
    const scenes = createSeedProject().scenes
    expect(hasTellingOrder(scenes)).toBe(true)
    const chapters = tellingChapters(scenes)
    expect(chapters[0].letter).toBe('A')
    // Chapter A is the chronological midpoint — proving telling ≠ chronological.
    expect(chapters[0].scenes.map((s) => s.id)).toContain('scene-midpoint')
  })

  it('offers at least A–E as chapter options', () => {
    expect(TELLING_LETTERS.slice(0, 5)).toEqual(['A', 'B', 'C', 'D', 'E'])
  })
})
