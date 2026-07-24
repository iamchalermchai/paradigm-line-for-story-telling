import { PHASE_WIDTH } from './seed'
import { bandIndexForX, getStructureTemplate } from './structure'
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
 * Pure auto-layout: place each scene on the timeline where its beat marker sits
 * (Catalyst → … → Ending), split above/below the paradigm line by arc relation,
 * and greedily row-pack so cards never overlap. Scenes without a beat keep the
 * author's x. Beat markers are re-spaced along the line. Locked nodes stay put.
 */
export function autoLayout(
  scenes: StoryScene[],
  beats: BeatMarker[],
): LayoutResult {
  // --- Scenes ---
  const laidOutScenes = scenes.map((s) => ({ ...s }))
  const byId = new Map(laidOutScenes.map((s) => [s.id, s]))

  // Anchor a scene on the timeline ("position = meaning"): a scene with a beat
  // sits directly under/over its beat marker; a scene without one keeps the
  // author's own x. The card is centred on that anchor.
  const anchorX = (s: StoryScene): number => {
    const at =
      s.beat !== undefined && BEAT_X_FRACTION[s.beat] !== undefined
        ? BEAT_X_FRACTION[s.beat]! * BOARD_WIDTH
        : s.position.x
    return at - SCENE_W / 2
  }

  // Place each side (above / below the line) by greedy row-packing along the
  // timeline: keep the x anchor, and push a card to a deeper row only when it
  // would overlap one already placed at that x — so beats stay aligned and
  // cards never collide.
  for (const side of ['above', 'below'] as const) {
    const sideScenes = laidOutScenes
      .filter((s) => !s.locked && isAboveLine(s) === (side === 'above'))
      .sort((a, b) => anchorX(a) - anchorX(b))

    const rowEnds: number[] = [] // right edge (x) currently occupied per row

    for (const scene of sideScenes) {
      const target = byId.get(scene.id)
      if (!target) continue
      const x = Math.max(0, anchorX(scene))

      // First row whose last card ends before this card's left edge (with gap).
      let row = rowEnds.findIndex((end) => x >= end + SCENE_GAP_X)
      if (row === -1) {
        row = rowEnds.length
        rowEnds.push(0)
      }
      rowEnds[row] = x + SCENE_W

      const distance = FIRST_ROW_OFFSET + row * ROW_H
      target.position = {
        x,
        y:
          side === 'above'
            ? PARADIGM_LINE_Y - distance - 160
            : PARADIGM_LINE_Y + distance,
      }
      // Keep the 4-phase shadow consistent with the new x.
      target.phase = fourPhaseForX(x + SCENE_W / 2)
    }
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
