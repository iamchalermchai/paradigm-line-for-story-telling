import { PHASE_WIDTH } from './seed'
import {
  bandIndexForX,
  bandRange,
  getStructureTemplate,
  type StructureTemplate,
} from './structure'
import {
  ABOVE_LINE_RELATIONS,
  BEAT_PHASE,
  PARADIGM_LINE_Y,
  STORY_PHASES,
} from './types'
import type {
  BeatMarker,
  StoryBeatType,
  StoryPhase,
  StoryScene,
} from './types'

const SCENE_W = 288
const SCENE_GAP_X = 40
const ROW_H = 240
const FIRST_ROW_OFFSET = 140 // distance of first row from the paradigm line

// Fractional x position (0..1 within the whole board) for each structural beat.
// Beat markers render at 160px wide, so adjacent fractions must be spaced by
// at least ~0.08 (224px on the default board width) to avoid overlapping.
const BEAT_X_FRACTION: Partial<Record<StoryBeatType, number>> = {
  catalyst: 0.18,
  want: 0.26,
  progress: 0.34,
  warning: 0.42,
  midpoint: 0.5,
  ghost: 0.58,
  low_point: 0.66,
  aha: 0.74,
  choice: 0.82,
  climax: 0.9,
  ending: 0.98,
}

const BOARD_WIDTH = PHASE_WIDTH * STORY_PHASES.length
const FOUR_PHASE = getStructureTemplate('four-phase')

function phaseIndex(phase: StoryPhase): number {
  return STORY_PHASES.indexOf(phase)
}

function isAboveLine(scene: StoryScene): boolean {
  return ABOVE_LINE_RELATIONS.includes(scene.arcRelation)
}

/** The 4-phase enum value for an x-position (the canonical phase shadow). */
function fourPhaseForX(x: number): StoryPhase {
  return STORY_PHASES[bandIndexForX(x / BOARD_WIDTH, FOUR_PHASE)]
}

export interface LayoutResult {
  scenes: StoryScene[]
  beats: BeatMarker[]
}

/**
 * Pure auto-layout: tidy scenes within the bands of the given structure
 * template (split above/below the paradigm line by arc relation, stacked) and
 * place beat markers along the line. A scene's band is derived from its current
 * x, so auto-layout arranges within a band without moving scenes between them.
 * Locked nodes keep their position.
 */
export function autoLayout(
  scenes: StoryScene[],
  beats: BeatMarker[],
  template: StructureTemplate = FOUR_PHASE,
): LayoutResult {
  // --- Scenes ---
  // Group by (band index, above/below) so we can stack without overlap.
  const buckets = new Map<string, StoryScene[]>()
  for (const scene of scenes) {
    const band = bandIndexForX(scene.position.x / BOARD_WIDTH, template)
    const key = `${band}:${isAboveLine(scene) ? 'above' : 'below'}`
    const arr = buckets.get(key) ?? []
    arr.push(scene)
    buckets.set(key, arr)
  }

  const laidOutScenes = scenes.map((s) => ({ ...s }))
  const byId = new Map(laidOutScenes.map((s) => [s.id, s]))

  // Story order, not creation order ("causation over sequence"): a scene with
  // a beat sorts at its beat's position along the line (Catalyst → … → Ending);
  // a scene without one keeps the author's own x as its intent.
  const storyX = (s: StoryScene): number =>
    s.beat !== undefined && BEAT_X_FRACTION[s.beat] !== undefined
      ? BEAT_X_FRACTION[s.beat]! * BOARD_WIDTH
      : s.position.x

  for (const [key, bucketScenes] of buckets) {
    const [bandStr, side] = key.split(':') as [string, 'above' | 'below']
    const [start] = bandRange(Number(bandStr), template)
    const colX = start * BOARD_WIDTH
    const ordered = [...bucketScenes].sort((a, b) => storyX(a) - storyX(b))

    ordered.forEach((scene, i) => {
      const target = byId.get(scene.id)
      if (!target || target.locked) return

      // Alternate horizontal offset so stacked cards don't perfectly overlap.
      const colInner = i % 2 === 0 ? 40 : 40 + SCENE_W + SCENE_GAP_X
      const rowIndex = Math.floor(i / 2)
      const distance = FIRST_ROW_OFFSET + rowIndex * ROW_H
      const x = colX + colInner

      target.position = {
        x,
        y:
          side === 'above'
            ? PARADIGM_LINE_Y - distance - 160
            : PARADIGM_LINE_Y + distance,
      }
      // Keep the 4-phase shadow consistent with the new x.
      target.phase = fourPhaseForX(x)
    })
  }

  // --- Beats ---
  const laidOutBeats = beats.map((beat) => {
    if (beat.locked) return { ...beat }
    const fraction = BEAT_X_FRACTION[beat.type] ?? phaseFallback(beat.type)
    return {
      ...beat,
      position: { x: fraction * BOARD_WIDTH, y: PARADIGM_LINE_Y - 12 },
    }
  })

  return { scenes: laidOutScenes, beats: laidOutBeats }
}

// Fallback x for beat types without an explicit fraction: centre of their phase.
function phaseFallback(type: StoryBeatType): number {
  const idx = phaseIndex(BEAT_PHASE[type])
  return (idx + 0.5) / STORY_PHASES.length
}
