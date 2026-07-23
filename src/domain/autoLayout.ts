import { PHASE_WIDTH } from './seed'
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

const SCENE_W = 240
const SCENE_GAP_X = 40
const ROW_H = 220
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

function phaseIndex(phase: StoryPhase): number {
  return STORY_PHASES.indexOf(phase)
}

function isAboveLine(scene: StoryScene): boolean {
  return ABOVE_LINE_RELATIONS.includes(scene.arcRelation)
}

export interface LayoutResult {
  scenes: StoryScene[]
  beats: BeatMarker[]
}

/**
 * Pure auto-layout: arrange scenes into their phase columns (split above/below
 * the paradigm line by arc relation, stacked by `order`) and place beat markers
 * along the line. Locked nodes keep their current position.
 */
export function autoLayout(
  scenes: StoryScene[],
  beats: BeatMarker[],
): LayoutResult {
  // --- Scenes ---
  // Group by (phase, above/below) so we can stack without overlap.
  const buckets = new Map<string, StoryScene[]>()
  for (const scene of scenes) {
    const key = `${scene.phase}:${isAboveLine(scene) ? 'above' : 'below'}`
    const arr = buckets.get(key) ?? []
    arr.push(scene)
    buckets.set(key, arr)
  }

  const laidOutScenes = scenes.map((s) => ({ ...s }))
  const byId = new Map(laidOutScenes.map((s) => [s.id, s]))

  for (const [key, bucketScenes] of buckets) {
    const [phase, side] = key.split(':') as [StoryPhase, 'above' | 'below']
    const colX = phaseIndex(phase) * PHASE_WIDTH
    const ordered = [...bucketScenes].sort((a, b) => a.order - b.order)

    ordered.forEach((scene, i) => {
      const target = byId.get(scene.id)
      if (!target || target.locked) return

      // Alternate horizontal offset so stacked cards don't perfectly overlap.
      const colInner = i % 2 === 0 ? 40 : 40 + SCENE_W + SCENE_GAP_X
      const rowIndex = Math.floor(i / 2)
      const distance = FIRST_ROW_OFFSET + rowIndex * ROW_H

      target.position = {
        x: colX + colInner,
        y:
          side === 'above'
            ? PARADIGM_LINE_Y - distance - 160
            : PARADIGM_LINE_Y + distance,
      }
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
