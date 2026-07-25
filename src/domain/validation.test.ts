import { describe, expect, it } from 'vitest'
import { createSeedProject } from './seed'
import { getStructureTemplate } from './structure'
import { validateAllScenes, validateScene } from './validation'
import type { StoryScene } from './types'

function baseScene(overrides: Partial<StoryScene> = {}): StoryScene {
  return {
    id: 's1',
    title: 'ฉาก',
    location: '',
    characters: ['แอล'],
    characterGoal: 'goal',
    action: 'ทำอะไรบางอย่าง',
    obstacle: '',
    internalConflict: '',
    outcome: 'ผลลัพธ์',
    changeAfterScene: 'เปลี่ยนแปลง',
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

describe('validateScene', () => {
  it('reports no warnings for a complete scene', () => {
    expect(validateScene(baseScene())).toEqual([])
  })

  it('warns when there is no character action', () => {
    const codes = validateScene(baseScene({ characters: [] })).map(
      (w) => w.code,
    )
    expect(codes).toContain('no_action')
  })

  it('warns when action text is blank', () => {
    const codes = validateScene(baseScene({ action: '   ' })).map(
      (w) => w.code,
    )
    expect(codes).toContain('no_action')
  })

  it('warns on missing outcome and missing change', () => {
    const codes = validateScene(
      baseScene({ outcome: '', changeAfterScene: '' }),
    ).map((w) => w.code)
    expect(codes).toContain('no_outcome')
    expect(codes).toContain('no_change')
  })

  it('warns when the scene sits outside its beat’s band', () => {
    // The Climax beat belongs to the last band, but x=0 is the first one.
    const codes = validateScene(
      baseScene({ beat: 'climax', position: { x: 0, y: 0 } }),
    ).map((w) => w.code)
    expect(codes).toContain('band_beat_conflict')
  })

  it('does not warn when the scene sits in its beat’s band', () => {
    // 0.9 * 2800 = 2520, inside the last band of 4 Phase.
    const codes = validateScene(
      baseScene({ beat: 'climax', position: { x: 2520, y: 0 } }),
    ).map((w) => w.code)
    expect(codes).not.toContain('band_beat_conflict')
  })

  it('judges the band against the selected structure, not 4 Phase', () => {
    const threeAct = getStructureTemplate('three-act')
    // x=1400 is the midpoint of the board: 4 Phase calls it band 2, Three Act
    // puts it inside Act 2, where the Three Act midpoint beat belongs.
    const scene = baseScene({ beat: 'midpoint', position: { x: 1400, y: 0 } })
    expect(validateScene(scene, [], threeAct).map((w) => w.code)).not.toContain(
      'band_beat_conflict',
    )
  })

  it('leaves a beat tag from another structure alone', () => {
    // 'ten' means nothing in 4 Phase, so there is no band to disagree with.
    const codes = validateScene(
      baseScene({ beat: 'ten', position: { x: 0, y: 0 } }),
    ).map((w) => w.code)
    expect(codes).not.toContain('band_beat_conflict')
  })

  it('flags a possible duplicate scene', () => {
    const a = baseScene({ id: 'a', title: 'ซ้ำ', action: 'เขียน' })
    const b = baseScene({ id: 'b', title: 'ซ้ำ', action: 'เขียน' })
    const codes = validateScene(a, [a, b]).map((w) => w.code)
    expect(codes).toContain('possible_duplicate')
  })

  it('seed scenes each carry an outcome and change', () => {
    for (const scene of createSeedProject().scenes) {
      const codes = validateScene(scene).map((w) => w.code)
      expect(codes).not.toContain('no_outcome')
      expect(codes).not.toContain('no_change')
    }
  })

  it('every seed scene sits in the band its beat belongs to', () => {
    const warnings = validateAllScenes(createSeedProject().scenes)
    const conflicts = Object.entries(warnings).flatMap(([id, list]) =>
      list
        .filter((w) => w.code === 'band_beat_conflict')
        .map((w) => `${id}: ${w.message}`),
    )
    expect(conflicts).toEqual([])
  })
})
