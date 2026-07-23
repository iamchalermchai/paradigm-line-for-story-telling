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

/**
 * Index of the band that contains a given x-position, expressed as a fraction
 * (0..1) of the board width. Positions left of the first band clamp to 0;
 * positions past the last band clamp to the last band. This makes a scene's
 * band a pure function of where it sits under the current template.
 */
export function bandIndexForX(
  fraction: number,
  template: StructureTemplate,
): number {
  const bands = template.bands
  let idx = 0
  for (let i = 0; i < bands.length; i++) {
    if (fraction >= bands[i].start) idx = i
    else break
  }
  return idx
}

/** [start, end) fractions of a band by index. Last band ends at 1. */
export function bandRange(
  index: number,
  template: StructureTemplate,
): [number, number] {
  const start = template.bands[index]?.start ?? 0
  const end = template.bands[index + 1]?.start ?? 1
  return [start, end]
}

/** Horizontal centre of a band as a fraction (0..1) of the board width. */
export function bandCenterFraction(
  index: number,
  template: StructureTemplate,
): number {
  const [start, end] = bandRange(index, template)
  return (start + end) / 2
}
