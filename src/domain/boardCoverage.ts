import { validateAllScenes } from './validation'
import {
  bandIndexForX,
  BOARD_WIDTH,
  type StructureTemplate,
  type TemplateBeat,
} from './structure'
import type { StoryScene } from './types'

export interface BoardCoverage {
  /** Template beats with no scene tagged to that beat. */
  emptyBeats: TemplateBeat[]
  /** Band indices with no scene whose x falls in that band. */
  emptyBandIndexes: number[]
  /** Scenes that currently carry validation warnings. */
  scenesWithWarnings: number
}

/**
 * Board-level planning gaps: which beats/bands are still empty, and how many
 * scenes fail the per-scene checks. Pure — no React.
 */
export function boardCoverage(
  scenes: StoryScene[],
  template: StructureTemplate,
): BoardCoverage {
  const tagged = new Set(
    scenes.map((s) => s.beat).filter((b): b is string => !!b),
  )
  const emptyBeats = template.beats.filter((b) => !tagged.has(b.key))

  const bandCounts = template.bands.map(() => 0)
  for (const scene of scenes) {
    const idx = bandIndexForX(scene.position.x / BOARD_WIDTH, template)
    if (bandCounts[idx] !== undefined) bandCounts[idx] += 1
  }
  const emptyBandIndexes = bandCounts
    .map((count, i) => (count === 0 ? i : -1))
    .filter((i) => i >= 0)

  const warnings = validateAllScenes(scenes, template)
  return {
    emptyBeats,
    emptyBandIndexes,
    scenesWithWarnings: Object.keys(warnings).length,
  }
}
