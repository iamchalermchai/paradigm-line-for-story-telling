import type { ArcRelation, Backstory, Character, StoryLayer, StoryScene } from './types'
import { ARC_RELATION_LABELS } from './types'

/** Old structure id — migrated to laneMode + four-phase in schema v6. */
export const LEGACY_LAYERED_STRUCTURE_ID = 'layered-memory'

export const STORY_LAYERS: StoryLayer[] = [
  'meta',
  'character',
  'memory',
  'ghost',
]

export const LAYER_LABELS: Record<StoryLayer, string> = {
  meta: 'META',
  character: 'CHARACTER',
  memory: 'MEMORY',
  ghost: 'GHOST',
}

export const LAYER_HINTS: Record<StoryLayer, string> = {
  meta: 'ผู้เล่า · กรอบการเล่า',
  character: 'เหตุการณ์บนเส้นเรื่อง',
  memory: 'ความทรงจำที่ถูกกระตุ้น',
  ghost: 'แผลที่หลอกหลอน',
}

/** Long copy for the expanded layer diagram sidebar. */
export const LAYER_DESCRIPTIONS: Record<StoryLayer, string> = {
  meta: 'ผู้เล่าที่รู้ตัวว่ากำลังเล่าเรื่อง มองเห็นเรื่องทั้งหมด สร้างระยะปลอดภัยที่เหมาะสมแล้ว',
  character:
    'เหตุการณ์ที่เป็นเส้นเรื่องหลัก มีขอบเขตของเรื่อง มีต้น มีจบ ผู้เล่ามีบทบาทเป็นตัวละครที่ตอบสนองต่อสถานการณ์และตัวละครอื่นๆ',
  memory:
    'ความทรงจำหรือเรื่องราวก่อนหน้านั้น ที่อธิบายว่าตัวละครคือใคร กระตุ้นขึ้นมาจากเหตุการณ์',
  ghost:
    'บาดแผลทางอารมณ์ที่ตัวละครได้รับในอดีต และยังคงตามหลอกหลอนมาจนถึงปัจจุบัน ส่งผลต่อการตัดสินใจ ความกลัว และความเชื่อที่ผิดของตัวละครในเส้นเรื่องหลัก',
}

export const LAYER_COLORS: Record<StoryLayer, string> = {
  meta: '#141619',
  character: '#3d4dec',
  memory: '#2f9c6c',
  ghost: '#cd5042',
}

/** Legacy snap Y — not used for main-board positioning after B+ (2026-07-25). */
export const LAYER_SNAP_Y: Record<StoryLayer, number> = {
  meta: -400,
  character: -100,
  memory: 240,
  ghost: 580,
}

export function isLaneMode(laneMode: boolean): boolean {
  return laneMode
}

export type LayerSuggestion = {
  layer: StoryLayer
  reason: string
  confidence: 'high' | 'medium' | 'low'
  /** When set, arc tag alone would differ — show in editor as a nudge. */
  arcNote?: string
}

const MEMORY_CUE = /ความทรงจำ|ย้อน|flashback|วัยเด็ก/i
const GHOST_HAUNT_CUE = /แผล|หลอก|ฝัน|nightmare|trauma|วิญ/i
const META_CUE = /\bMETA\b|กรอบการเล่า|ผู้เล่ารู้/i

function sceneText(scene: StoryScene): string {
  return [
    scene.title,
    scene.action,
    scene.internalConflict,
    scene.notes,
  ].join(' ')
}

function hasMemoryCue(scene: StoryScene): boolean {
  return MEMORY_CUE.test(`${scene.title} ${scene.action}`)
}

function hasGhostHauntCue(scene: StoryScene): boolean {
  return GHOST_HAUNT_CUE.test(sceneText(scene))
}

/** Soft hint from arc tag — does not override text/memory cues. */
function suggestFromArcTag(arc: ArcRelation): LayerSuggestion | null {
  if (arc === 'ghost') {
    return {
      layer: 'character',
      reason: 'แตะ Ghost บนเส้น',
      confidence: 'medium',
      arcNote:
        'แท็ก Ghost = แตะแผลบน Paradigm · มิติปัจจุบันมักเป็น CHARACTER — ถ้าย้อนหรือหลอกเลือก MEMORY/GHOST',
    }
  }
  if (arc === 'neutral') return null
  return {
    layer: 'character',
    reason: `แท็ก ${ARC_RELATION_LABELS[arc]} บนเส้น`,
    confidence: 'medium',
  }
}

export function suggestStoryLayer(
  scene: StoryScene,
  backstory?: Backstory,
  characters?: Character[],
): LayerSuggestion {
  if (META_CUE.test(scene.notes) || META_CUE.test(scene.title)) {
    return {
      layer: 'meta',
      reason: 'จากโน้ต/ชื่อ — กรอบการเล่า',
      confidence: 'high',
    }
  }
  if (hasMemoryCue(scene)) {
    return {
      layer: 'memory',
      reason: scene.arcRelation === 'ghost'
        ? 'แตะ Ghost + ข้อความย้อน/ความทรงจำ'
        : 'จากข้อความฉาก — ย้อน/ความทรงจำ',
      confidence: 'high',
    }
  }
  if (hasGhostHauntCue(scene)) {
    return {
      layer: 'ghost',
      reason:
        scene.arcRelation === 'ghost'
          ? 'แตะ Ghost + ข้อความแผล/หลอก'
          : 'จากข้อความฉาก — แผลหลอก',
      confidence: scene.arcRelation === 'ghost' ? 'high' : 'medium',
    }
  }

  const ghostText = [
    backstory?.ghost ?? '',
    ...(characters ?? [])
      .filter((c) => scene.characters.includes(c.name))
      .map((c) => c.ghost),
  ].join(' ')
  if (
    ghostText.length > 8 &&
    scene.title &&
    ghostText.includes(scene.title.slice(0, 4))
  ) {
    return {
      layer: 'ghost',
      reason: 'จาก Ghost ใน Backstory/ตัวละคร',
      confidence: 'medium',
    }
  }

  const fromArc = suggestFromArcTag(scene.arcRelation)
  if (fromArc) return fromArc

  if (scene.beat && scene.arcRelation !== 'neutral') {
    return {
      layer: 'character',
      reason: 'จาก beat + แท็กเส้น',
      confidence: 'medium',
    }
  }

  return {
    layer: 'character',
    reason: 'ค่าเริ่มต้น — เหตุการณ์ปัจจุบัน',
    confidence: 'low',
  }
}

export function layerForY(y: number): StoryLayer {
  let best: StoryLayer = 'character'
  let bestDist = Infinity
  for (const layer of STORY_LAYERS) {
    const d = Math.abs(y - LAYER_SNAP_Y[layer])
    if (d < bestDist) {
      bestDist = d
      best = layer
    }
  }
  return best
}

export function snapSceneToLayer(
  position: { x: number; y: number },
  layer?: StoryLayer,
): { x: number; y: number; storyLayer: StoryLayer } {
  const storyLayer = layer ?? layerForY(position.y)
  return {
    x: position.x,
    y: LAYER_SNAP_Y[storyLayer],
    storyLayer,
  }
}

export function laneStats(scenes: StoryScene[]) {
  const counts: Record<StoryLayer, number> = {
    meta: 0,
    character: 0,
    memory: 0,
    ghost: 0,
  }
  for (const s of scenes) counts[s.storyLayer]++
  return counts
}

/** Map scene x-order to diagram x (mini/full viewBox width). */
export function sceneDiagramX(
  scene: StoryScene,
  scenes: StoryScene[],
  min: number,
  max: number,
): number {
  const sorted = [...scenes].sort((a, b) => a.position.x - b.position.x)
  const idx = sorted.findIndex((s) => s.id === scene.id)
  if (idx < 0) return (min + max) / 2
  if (sorted.length <= 1) return (min + max) / 2
  return min + (idx / (sorted.length - 1)) * (max - min)
}
