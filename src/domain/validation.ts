import {
  bandIndexForX,
  beatBandIndex,
  BOARD_WIDTH,
  getStructureTemplate,
  templateBeat,
  type StructureTemplate,
} from './structure'
import type { StoryScene } from './types'

export type WarningCode =
  | 'no_action'
  | 'no_outcome'
  | 'no_change'
  | 'band_beat_conflict'
  | 'possible_duplicate'

export interface SceneWarning {
  code: WarningCode
  message: string
}

function isBlank(value: string | undefined): boolean {
  return !value || value.trim().length === 0
}

function fingerprint(scene: StoryScene): string {
  return `${scene.title.trim()}|${scene.action.trim()}`.toLowerCase()
}

/**
 * Return the validation warnings for a single scene. `others` is the rest of
 * the scenes in the project, used for duplicate detection. `template` is the
 * structure the board is currently showing, which decides where each beat
 * belongs; beats the template does not define (a tag left over from another
 * structure) are left alone rather than nagged about.
 */
export function validateScene(
  scene: StoryScene,
  others: StoryScene[] = [],
  template: StructureTemplate = getStructureTemplate(''),
): SceneWarning[] {
  const warnings: SceneWarning[] = []

  if (scene.characters.length === 0 || isBlank(scene.action)) {
    warnings.push({
      code: 'no_action',
      message: 'ยังไม่มีตัวละครที่ลงมือทำ (ต้องมีทั้งตัวละครและการกระทำ)',
    })
  }

  if (isBlank(scene.outcome)) {
    warnings.push({
      code: 'no_outcome',
      message: 'ฉากนี้ยังไม่มีผลลัพธ์',
    })
  }

  if (isBlank(scene.changeAfterScene)) {
    warnings.push({
      code: 'no_change',
      message: 'ยังไม่ได้ระบุว่าอะไรเปลี่ยนหลังฉากนี้',
    })
  }

  const beat = templateBeat(template, scene.beat)
  if (
    beat &&
    beatBandIndex(beat, template) !==
      bandIndexForX(scene.position.x / BOARD_WIDTH, template)
  ) {
    warnings.push({
      code: 'band_beat_conflict',
      message: `ฉากนี้ไม่ได้อยู่ในช่วงที่ ${beat.label} ควรอยู่ (${template.bands[beatBandIndex(beat, template)].label})`,
    })
  }

  const fp = fingerprint(scene)
  if (
    !isBlank(scene.title) &&
    others.some((o) => o.id !== scene.id && fingerprint(o) === fp)
  ) {
    warnings.push({
      code: 'possible_duplicate',
      message: 'อาจซ้ำกับฉากอื่น (ชื่อและการกระทำเหมือนกัน)',
    })
  }

  return warnings
}

/** Validate every scene, returning a map of sceneId -> warnings (non-empty only). */
export function validateAllScenes(
  scenes: StoryScene[],
  template: StructureTemplate = getStructureTemplate(''),
): Record<string, SceneWarning[]> {
  const result: Record<string, SceneWarning[]> = {}
  for (const scene of scenes) {
    const warnings = validateScene(scene, scenes, template)
    if (warnings.length > 0) result[scene.id] = warnings
  }
  return result
}
