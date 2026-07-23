import { describe, expect, it } from 'vitest'
import { createSeedProject } from './seed'
import { validateScene } from './validation'
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
    outcome: 'ผลลัพธ์',
    changeAfterScene: 'เปลี่ยนแปลง',
    phase: 'setup',
    arcRelation: 'neutral',
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

  it('warns when phase conflicts with beat', () => {
    // climax belongs to the ending phase, not setup
    const codes = validateScene(
      baseScene({ phase: 'setup', beat: 'climax' }),
    ).map((w) => w.code)
    expect(codes).toContain('phase_beat_conflict')
  })

  it('does not warn when phase matches beat', () => {
    const codes = validateScene(
      baseScene({ phase: 'ending', beat: 'climax' }),
    ).map((w) => w.code)
    expect(codes).not.toContain('phase_beat_conflict')
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
})
