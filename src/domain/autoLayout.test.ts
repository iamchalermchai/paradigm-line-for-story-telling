import { describe, expect, it } from 'vitest'
import { autoLayout } from './autoLayout'
import { createSeedProject } from './seed'
import { PHASE_WIDTH } from './seed'
import { bandIndexForX, getStructureTemplate } from './structure'
import { ABOVE_LINE_RELATIONS, PARADIGM_LINE_Y, STORY_PHASES } from './types'

const BOARD_WIDTH = PHASE_WIDTH * STORY_PHASES.length

describe('autoLayout', () => {
  it('places above-line relations above the paradigm line and others below', () => {
    const seed = createSeedProject()
    const { scenes } = autoLayout(seed.scenes, seed.beats)
    for (const scene of scenes) {
      if (ABOVE_LINE_RELATIONS.includes(scene.arcRelation)) {
        expect(scene.position.y).toBeLessThan(PARADIGM_LINE_Y)
      } else {
        expect(scene.position.y).toBeGreaterThanOrEqual(PARADIGM_LINE_Y)
      }
    }
  })

  it('keeps locked scenes in place', () => {
    const seed = createSeedProject()
    const locked = { ...seed.scenes[0], locked: true, position: { x: 999, y: 888 } }
    const scenes = [locked, ...seed.scenes.slice(1)]
    const result = autoLayout(scenes, seed.beats)
    const stillLocked = result.scenes.find((s) => s.id === locked.id)
    expect(stillLocked?.position).toEqual({ x: 999, y: 888 })
  })

  it('orders beats left-to-right by their structural position', () => {
    const seed = createSeedProject()
    const { beats } = autoLayout(seed.scenes, seed.beats)
    const catalyst = beats.find((b) => b.type === 'catalyst')!
    const midpoint = beats.find((b) => b.type === 'midpoint')!
    const climax = beats.find((b) => b.type === 'climax')!
    expect(catalyst.position.x).toBeLessThan(midpoint.position.x)
    expect(midpoint.position.x).toBeLessThan(climax.position.x)
  })

  it('orders scenes by beat progression, not creation order', () => {
    const seed = createSeedProject()
    // Two scenes in the same band+side: climax-beat scene created *before* a
    // want-beat scene (order swapped). Layout must still put want left of climax.
    const base = seed.scenes[0]
    const want = {
      ...base,
      id: 'x-want',
      beat: 'want' as const,
      arcRelation: 'want' as const,
      order: 99, // created last
      position: { x: 100, y: -300 },
      locked: false,
    }
    const climax = {
      ...base,
      id: 'x-climax',
      beat: 'climax' as const,
      arcRelation: 'want' as const,
      order: 1, // created first
      position: { x: 120, y: -300 },
      locked: false,
    }
    const { scenes } = autoLayout([climax, want], seed.beats)
    const wantOut = scenes.find((s) => s.id === 'x-want')!
    const climaxOut = scenes.find((s) => s.id === 'x-climax')!
    expect(wantOut.position.x).toBeLessThan(climaxOut.position.x)
  })

  it('scenes without beats keep their relative x intent', () => {
    const seed = createSeedProject()
    const base = { ...seed.scenes[0], beat: undefined, locked: false }
    const left = { ...base, id: 'p-left', order: 9, position: { x: 200, y: 150 } }
    const right = { ...base, id: 'p-right', order: 1, position: { x: 600, y: 150 } }
    const { scenes } = autoLayout([right, left], seed.beats)
    const l = scenes.find((s) => s.id === 'p-left')!
    const r = scenes.find((s) => s.id === 'p-right')!
    expect(l.position.x).toBeLessThan(r.position.x)
  })

  it('keeps each scene inside its current band under the chosen template', () => {
    const seed = createSeedProject()
    const threeAct = getStructureTemplate('three-act')
    const before = seed.scenes.map((s) => ({
      id: s.id,
      band: bandIndexForX(s.position.x / BOARD_WIDTH, threeAct),
    }))
    const { scenes } = autoLayout(seed.scenes, seed.beats, threeAct)
    for (const scene of scenes) {
      if (scene.locked) continue
      const bandAfter = bandIndexForX(scene.position.x / BOARD_WIDTH, threeAct)
      const bandBefore = before.find((b) => b.id === scene.id)!.band
      expect(bandAfter).toBe(bandBefore)
    }
  })
})
