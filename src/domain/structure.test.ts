import { describe, expect, it } from 'vitest'
import {
  bandIndexForX,
  DEFAULT_STRUCTURE_ID,
  getStructureTemplate,
  STRUCTURE_TEMPLATES,
} from './structure'

describe('structure templates', () => {
  it('offers 4 Phase, Three Act and Save the Cat', () => {
    const ids = STRUCTURE_TEMPLATES.map((t) => t.id)
    expect(ids).toEqual(['four-phase', 'three-act', 'save-the-cat'])
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
