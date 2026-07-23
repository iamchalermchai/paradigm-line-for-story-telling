import { BEAT_PHASE } from './types'
import type { StoryScene } from './types'

export type WarningCode =
  | 'no_action'
  | 'no_outcome'
  | 'no_change'
  | 'phase_beat_conflict'
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
 * the scenes in the project, used for duplicate detection.
 */
export function validateScene(
  scene: StoryScene,
  others: StoryScene[] = [],
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

  if (scene.beat && BEAT_PHASE[scene.beat] !== scene.phase) {
    warnings.push({
      code: 'phase_beat_conflict',
      message: 'ช่วงของเรื่องขัดกับ Story Beat ที่เลือกไว้',
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
): Record<string, SceneWarning[]> {
  const result: Record<string, SceneWarning[]> = {}
  for (const scene of scenes) {
    const warnings = validateScene(scene, scenes)
    if (warnings.length > 0) result[scene.id] = warnings
  }
  return result
}
