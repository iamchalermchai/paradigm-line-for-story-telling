import { describe, expect, it } from 'vitest'
import { autoLayout } from './autoLayout'
import { createSeedProject } from './seed'
import { ABOVE_LINE_RELATIONS, PARADIGM_LINE_Y } from './types'

// Mirror of the SCENE_W constant in autoLayout.ts (card width used for centring).
const SCENE_W_TEST = 288

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

  it('places a scene under its own beat marker', () => {
    const seed = createSeedProject()
    const { scenes, beats } = autoLayout(seed.scenes, seed.beats)
    // A beat scene's centre should sit at its beat marker's x (card centred on it).
    const wantScene = scenes.find((s) => s.beat === 'want')!
    const wantBeat = beats.find((b) => b.type === 'want')!
    const cardCentre = wantScene.position.x + SCENE_W_TEST / 2
    expect(Math.abs(cardCentre - wantBeat.position.x)).toBeLessThan(4)
  })

  it('row-packs overlapping beat scenes into separate rows (no collision)', () => {
    const seed = createSeedProject()
    // Two above-line scenes on the same beat must not share the same y row.
    const base = { ...seed.scenes[0], arcRelation: 'want' as const, locked: false }
    const a = { ...base, id: 'a', beat: 'midpoint' as const, position: { x: 0, y: 0 } }
    const b = { ...base, id: 'b', beat: 'midpoint' as const, position: { x: 0, y: 0 } }
    const { scenes } = autoLayout([a, b], seed.beats)
    const ya = scenes.find((s) => s.id === 'a')!.position.y
    const yb = scenes.find((s) => s.id === 'b')!.position.y
    expect(ya).not.toBe(yb)
  })
})
