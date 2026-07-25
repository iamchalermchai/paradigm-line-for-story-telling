import { describe, expect, it } from 'vitest'
import { PHASE_WIDTH } from './seed'
import {
  bandIndexForX,
  beatBandIndex,
  beatLabel,
  BOARD_WIDTH,
  DEFAULT_STRUCTURE_ID,
  findBeatAnywhere,
  getStructureTemplate,
  STRUCTURE_TEMPLATES,
  templateBeat,
  templateBeatMarkers,
} from './structure'

describe('structure templates', () => {
  it('offers 4 Phase, Three Act, Save the Cat, Kishōtenketsu and Hero’s Journey', () => {
    const ids = STRUCTURE_TEMPLATES.map((t) => t.id)
    expect(ids).toEqual([
      'four-phase',
      'three-act',
      'save-the-cat',
      'kishotenketsu',
      'heros-journey',
    ])
  })

  it('every template declares axis labels for the board', () => {
    for (const t of STRUCTURE_TEMPLATES) {
      expect(t.axis.lineTitle.length).toBeGreaterThan(0)
      expect(t.axis.aboveHint.length).toBeGreaterThan(0)
      expect(t.axis.belowHint.length).toBeGreaterThan(0)
    }
  })

  it("Hero's Journey has 12 Vogler beats with threshold / ordeal / resurrection ticks", () => {
    const hj = getStructureTemplate('heros-journey')
    expect(hj.bands.map((b) => b.label)).toEqual([
      'Departure',
      'Initiation',
      'Return',
    ])
    expect(hj.beats).toHaveLength(12)
    const ticks = hj.beats.filter((b) => b.shape === 'tick')
    expect(ticks.map((b) => b.key)).toEqual([
      'threshold',
      'ordeal',
      'resurrection',
    ])
    expect(templateBeat(hj, 'reward')?.shape).toBe('square')
  })

  it('board width matches the four phase columns the canvas draws', () => {
    expect(BOARD_WIDTH).toBe(PHASE_WIDTH * 4)
  })

  it('each template starts at 0 and has strictly increasing band starts', () => {
    for (const t of STRUCTURE_TEMPLATES) {
      expect(t.bands[0].start).toBe(0)
      for (let i = 1; i < t.bands.length; i++) {
        expect(t.bands[i].start).toBeGreaterThan(t.bands[i - 1].start)
        expect(t.bands[i].start).toBeLessThan(1)
      }
    }
  })

  it('getStructureTemplate falls back to the default for unknown ids', () => {
    expect(getStructureTemplate('nope').id).toBe(DEFAULT_STRUCTURE_ID)
    expect(getStructureTemplate('three-act').id).toBe('three-act')
  })

  it('every template ships beats in left-to-right order with unique keys', () => {
    for (const t of STRUCTURE_TEMPLATES) {
      expect(t.beats.length).toBeGreaterThan(0)
      const keys = t.beats.map((b) => b.key)
      expect(new Set(keys).size).toBe(keys.length)
      for (let i = 1; i < t.beats.length; i++) {
        expect(t.beats[i].fraction).toBeGreaterThan(t.beats[i - 1].fraction)
      }
      for (const beat of t.beats) {
        expect(beat.fraction).toBeGreaterThanOrEqual(0)
        expect(beat.fraction).toBeLessThanOrEqual(1)
        expect(beat.label.length).toBeGreaterThan(0)
        expect(beat.hint.length).toBeGreaterThan(0)
      }
    }
  })

  it('labels on the same tier never overlap on the board', () => {
    // Markers render ~160px wide, so same-row neighbours need that much room.
    for (const t of STRUCTURE_TEMPLATES) {
      for (const tier of [undefined, 1] as const) {
        const row = t.beats.filter((b) => b.tier === tier)
        for (let i = 1; i < row.length; i++) {
          const gap = (row[i].fraction - row[i - 1].fraction) * BOARD_WIDTH
          expect(gap).toBeGreaterThanOrEqual(160)
        }
      }
    }
  })

  it('every template carries teaching copy for the picker and help', () => {
    for (const t of STRUCTURE_TEMPLATES) {
      expect(t.description.length).toBeGreaterThan(20)
      expect(t.startHere.length).toBeGreaterThan(20)
    }
  })

  it('Kishōtenketsu pivots on a single Ten beat', () => {
    const kishotenketsu = getStructureTemplate('kishotenketsu')
    expect(kishotenketsu.beats.map((b) => b.key)).toEqual([
      'ki',
      'sho',
      'ten',
      'ketsu',
    ])
    // Ten is the only structural landmark: the pivot, not a conflict.
    const ticks = kishotenketsu.beats.filter((b) => b.shape === 'tick')
    expect(ticks.map((b) => b.key)).toEqual(['ten'])
    expect(beatBandIndex(ticks[0], kishotenketsu)).toBe(2)
  })
})

describe('beat lookup', () => {
  const fourPhase = getStructureTemplate('four-phase')
  const kishotenketsu = getStructureTemplate('kishotenketsu')

  it('finds a beat inside its own template only', () => {
    expect(templateBeat(fourPhase, 'midpoint')?.label).toBe('Midpoint')
    expect(templateBeat(fourPhase, 'ten')).toBeUndefined()
    expect(templateBeat(fourPhase, undefined)).toBeUndefined()
  })

  it('resolves a tag left over from another structure', () => {
    expect(findBeatAnywhere('ten', fourPhase)?.key).toBe('ten')
    expect(beatLabel('ten', fourPhase)).toBe('転 จุดพลิก')
  })

  it('falls back to the raw key for an unknown beat', () => {
    expect(beatLabel('not_a_beat')).toBe('not_a_beat')
    expect(beatLabel(undefined)).toBe('')
  })

  it('prefers the current template when two structures share a key', () => {
    // 'midpoint' exists in 4 Phase, Three Act and Save the Cat.
    const stc = getStructureTemplate('save-the-cat')
    expect(findBeatAnywhere('midpoint', stc)?.fraction).toBe(
      templateBeat(stc, 'midpoint')?.fraction,
    )
  })

  it('every beat sits in the band it visibly occupies', () => {
    for (const t of STRUCTURE_TEMPLATES) {
      for (const beat of t.beats) {
        const band = beatBandIndex(beat, t)
        expect(band).toBe(bandIndexForX(beat.fraction, t))
        expect(t.bands[band]).toBeDefined()
      }
    }
  })

  it('builds default markers on the line, one per template beat', () => {
    const markers = templateBeatMarkers(kishotenketsu)
    expect(markers.map((m) => m.type)).toEqual(['ki', 'sho', 'ten', 'ketsu'])
    expect(markers[0].id).toBe('beat-ki')
    // Hints ride along as descriptions so a fresh structure explains itself.
    expect(markers[2].description).toContain('เปลี่ยนความหมาย')
    expect(markers.every((m) => m.position.y === markers[0].position.y)).toBe(true)
    expect(markers[2].position.x).toBeCloseTo(0.625 * BOARD_WIDTH, 5)
  })
})

describe('bandIndexForX', () => {
  const fourPhase = getStructureTemplate('four-phase')
  const threeAct = getStructureTemplate('three-act')

  it('maps fractions to the containing band for 4 Phase', () => {
    expect(bandIndexForX(0, fourPhase)).toBe(0)
    expect(bandIndexForX(0.1, fourPhase)).toBe(0)
    expect(bandIndexForX(0.25, fourPhase)).toBe(1)
    expect(bandIndexForX(0.3, fourPhase)).toBe(1)
    expect(bandIndexForX(0.6, fourPhase)).toBe(2)
    expect(bandIndexForX(0.99, fourPhase)).toBe(3)
  })

  it('respects the different boundaries of Three Act', () => {
    // Act 1 [0,0.25), Act 2 [0.25,0.75), Act 3 [0.75,1]
    expect(bandIndexForX(0.1, threeAct)).toBe(0)
    expect(bandIndexForX(0.3, threeAct)).toBe(1)
    expect(bandIndexForX(0.6, threeAct)).toBe(1)
    expect(bandIndexForX(0.8, threeAct)).toBe(2)
  })

  it('clamps out-of-range positions to the first / last band', () => {
    expect(bandIndexForX(-1, fourPhase)).toBe(0)
    expect(bandIndexForX(5, fourPhase)).toBe(3)
    expect(bandIndexForX(5, threeAct)).toBe(2)
  })
})
