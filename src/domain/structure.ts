// Selectable vertical structure overlays for the board. A template divides the
// horizontal timeline into labelled bands with vertical divider lines. This is
// a visual framing layer — it does not change scene phase data or coordinates.

export interface StructureBand {
  label: string
  /** Left edge of the band as a fraction (0..1) of the board width. First band starts at 0. */
  start: number
}

export interface StructureTemplate {
  id: string
  name: string
  bands: StructureBand[]
}

export const STRUCTURE_TEMPLATES: StructureTemplate[] = [
  {
    id: 'four-phase',
    name: '4 Phase',
    bands: [
      { label: '1. เริ่มต้น', start: 0 },
      { label: '2. ช่วงแรก', start: 0.25 },
      { label: '3. ช่วงกลาง', start: 0.5 },
      { label: '4. ช่วงท้าย', start: 0.75 },
    ],
  },
  {
    id: 'three-act',
    name: 'Three Act',
    bands: [
      { label: 'Act 1 · Setup', start: 0 },
      { label: 'Act 2 · Confrontation', start: 0.25 },
      { label: 'Act 3 · Resolution', start: 0.75 },
    ],
  },
  {
    id: 'save-the-cat',
    name: 'Save the Cat',
    bands: [
      { label: 'Act 1 · Setup', start: 0 },
      { label: 'Fun & Games', start: 0.2 },
      { label: 'Bad Guys Close In', start: 0.5 },
      { label: 'Finale', start: 0.75 },
    ],
  },
]

export const DEFAULT_STRUCTURE_ID = 'four-phase'

/** Look up a template by id, falling back to the default (4 Phase). */
export function getStructureTemplate(id: string): StructureTemplate {
  return (
    STRUCTURE_TEMPLATES.find((t) => t.id === id) ?? STRUCTURE_TEMPLATES[0]
  )
}
