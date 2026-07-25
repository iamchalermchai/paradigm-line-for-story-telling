import { describe, expect, it } from 'vitest'
import { createSeedProject } from './seed'
import {
  chapterLetter,
  chapterLetterForScene,
  hasTellingOrder,
  tellingChapters,
  tellingOrderKeys,
} from './telling'
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
    internalConflict: '',
    outcome: '',
    changeAfterScene: '',
    phase: 'setup',
    arcRelation: 'neutral',
    storyLayer: 'character',
    tellingChapter: chapter,
    position: { x: 0, y: 0 },
    order: 0,
    notes: '',
    collapsed: false,
    locked: false,
  }
}

describe('chapterLetter (spreadsheet-style, unlimited)', () => {
  it('maps indices to A…Z then AA, AB…', () => {
    expect(chapterLetter(0)).toBe('A')
    expect(chapterLetter(25)).toBe('Z')
    expect(chapterLetter(26)).toBe('AA')
    expect(chapterLetter(27)).toBe('AB')
    expect(chapterLetter(51)).toBe('AZ')
    expect(chapterLetter(52)).toBe('BA')
  })
})

describe('telling chapters', () => {
  it('derives order from keys when none is stored, dropping unassigned', () => {
    const scenes = [scene('s1', 'k2'), scene('s2', 'k1'), scene('s3', 'k2'), scene('s4')]
    const chapters = tellingChapters(scenes, [])
    // keys sorted → k1, k2 → letters A, B
    expect(chapters.map((c) => [c.key, c.letter])).toEqual([
      ['k1', 'A'],
      ['k2', 'B'],
    ])
    expect(chapters[1].scenes.map((s) => s.id)).toEqual(['s1', 's3'])
  })

  it('respects an explicit order and relabels letters by position', () => {
    const scenes = [scene('s1', 'k1'), scene('s2', 'k2')]
    // Put k2 first → k2 becomes A, k1 becomes B.
    const chapters = tellingChapters(scenes, ['k2', 'k1'])
    expect(chapters.map((c) => [c.key, c.letter])).toEqual([
      ['k2', 'A'],
      ['k1', 'B'],
    ])
  })

  it('keeps empty chapters listed in the order (as drop targets)', () => {
    const scenes = [scene('s1', 'k1')]
    const chapters = tellingChapters(scenes, ['k1', 'k2-empty'])
    expect(chapters.map((c) => c.key)).toEqual(['k1', 'k2-empty'])
    expect(chapters[1].scenes).toHaveLength(0)
  })

  it('chapterLetterForScene reflects the stored order', () => {
    const scenes = [scene('s1', 'k1'), scene('s2', 'k2')]
    expect(chapterLetterForScene(scenes[0], scenes, ['k2', 'k1'])).toBe('B')
    expect(chapterLetterForScene(scene('x'), scenes, [])).toBeUndefined()
  })

  it('appends scene keys not present in the stored order', () => {
    const scenes = [scene('s1', 'k1'), scene('s2', 'k9')]
    expect(tellingOrderKeys(scenes, ['k1'])).toEqual(['k1', 'k9'])
  })

  it('the seed ships a non-linear telling starting at chapter A', () => {
    const project = createSeedProject()
    expect(hasTellingOrder(project.scenes)).toBe(true)
    const chapters = tellingChapters(project.scenes, project.tellingChapterOrder)
    expect(chapters[0].letter).toBe('A')
    // Chapter A is the chronological midpoint — telling ≠ chronological.
    expect(chapters[0].scenes.map((s) => s.id)).toContain('scene-midpoint')
  })
})
