import {
  bandIndexForX,
  BOARD_WIDTH,
  findBeatAnywhere,
  getStructureTemplate,
  templateBeat,
  type StructureTemplate,
} from './structure'
import { ABOVE_LINE_RELATIONS, PARADIGM_LINE_Y, STORY_PHASES } from './types'
import type { BeatMarker, StoryPhase, StoryScene } from './types'

const SCENE_W = 288
const SCENE_GAP_X = 40
const ROW_H = 240
const FIRST_ROW_OFFSET = 140 // distance of first row from the paradigm line

const FOUR_PHASE = getStructureTemplate('four-phase')

function isAboveLine(scene: StoryScene): boolean {
  return ABOVE_LINE_RELATIONS.includes(scene.arcRelation)
}

/** The 4-phase enum value for an x-position (the legacy phase shadow). */
function fourPhaseForX(x: number): StoryPhase {
  return STORY_PHASES[bandIndexForX(x / BOARD_WIDTH, FOUR_PHASE)]
}

export interface LayoutResult {
  scenes: StoryScene[]
  beats: BeatMarker[]
}

/**
 * Pure auto-layout: place each scene on the timeline where its beat marker sits
 * (first beat → … → last), split above/below the paradigm line by arc relation,
 * and greedily row-pack so cards never overlap. Scenes without a beat keep the
 * author's x. Beat markers are re-spaced along the line. Locked nodes stay put.
 *
 * Beat positions come from `template`, so laying out a Save the Cat board packs
 * cards against the Save the Cat beat sheet rather than the 4-Phase one.
 */
export function autoLayout(
  scenes: StoryScene[],
  beats: BeatMarker[],
  template: StructureTemplate = FOUR_PHASE,
): LayoutResult {
  // A beat may be tagged from another structure (the author kept the tag
  // through a switch), so fall back to that structure's own position for it.
  // Markers and the cards under them resolve through the same function, which
  // is what keeps a card sitting beneath its marker either way.
  const beatFraction = (key: string | undefined): number | undefined =>
    (templateBeat(template, key) ?? findBeatAnywhere(key, template))?.fraction

  // --- Scenes ---
  const laidOutScenes = scenes.map((s) => ({ ...s }))
  const byId = new Map(laidOutScenes.map((s) => [s.id, s]))

  // Anchor a scene on the timeline ("position = meaning"): a scene with a beat
  // sits directly under/over its beat marker; a scene without one keeps the
  // author's own x. The card is centred on that anchor.
  const anchorX = (s: StoryScene): number => {
    const fraction = beatFraction(s.beat)
    const at = fraction !== undefined ? fraction * BOARD_WIDTH : s.position.x
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
      // Keep the legacy 4-phase shadow consistent with the new x.
      target.phase = fourPhaseForX(x + SCENE_W / 2)
    }
  }

  // --- Beats ---
  // A marker with a key no structure defines has no position to claim, so it
  // keeps the one the author gave it.
  const laidOutBeats = beats.map((beat) => {
    if (beat.locked) return { ...beat }
    const fraction = beatFraction(beat.type)
    if (fraction === undefined) return { ...beat }
    return {
      ...beat,
      position: { x: fraction * BOARD_WIDTH, y: PARADIGM_LINE_Y - 12 },
    }
  })

  return { scenes: laidOutScenes, beats: laidOutBeats }
}
