import { describe, expect, it } from 'vitest'
import {
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
