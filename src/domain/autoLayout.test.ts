import { describe, expect, it } from 'vitest'
import { autoLayout } from './autoLayout'
import { createSeedProject } from './seed'
import { ABOVE_LINE_RELATIONS, PARADIGM_LINE_Y } from './types'

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
})
