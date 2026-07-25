import type { Backstory, Character, StoryLayer, StoryScene } from './types'

export const LAYERED_MEMORY_ID = 'layered-memory'

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

export const LAYER_COLORS: Record<StoryLayer, string> = {
  meta: '#141619',
  character: '#3d4dec',
  memory: '#2f9c6c',
  ghost: '#cd5042',
}

/** Scene card top-left Y snapped to each lane (layered-memory only). */
export const LAYER_SNAP_Y: Record<StoryLayer, number> = {
  meta: -400,
  character: -100,
  memory: 240,
  ghost: 580,
}

export function isLayeredMemory(structureId: string): boolean {
  return structureId === LAYERED_MEMORY_ID
}

export type LayerSuggestion = {
  layer: StoryLayer
  reason: string
  confidence: 'high' | 'medium' | 'low'
}

export function suggestStoryLayer(
  scene: StoryScene,
  backstory?: Backstory,
  characters?: Character[],
): LayerSuggestion {
  if (scene.arcRelation === 'ghost') {
    return {
      layer: 'ghost',
      reason: 'จากแท็ก Ghost',
      confidence: 'high',
    }
  }
  if (scene.notes.toUpperCase().includes('META')) {
    return {
      layer: 'meta',
      reason: 'จากโน้ต META',
      confidence: 'high',
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
      reason: 'จากข้อความใกล้ Ghost',
      confidence: 'medium',
    }
  }
  if (/ความทรงจำ|ย้อน|flashback|วัยเด็ก/i.test(`${scene.title} ${scene.action}`)) {
    return {
      layer: 'memory',
      reason: 'จากข้อความฉาก',
      confidence: 'medium',
    }
  }
  if (
    scene.beat &&
    ['lie', 'want', 'need', 'lie_at_work'].includes(scene.arcRelation)
  ) {
    return {
      layer: 'character',
      reason: 'จาก beat + แท็ก arc',
      confidence: 'medium',
    }
  }
  return {
    layer: 'character',
    reason: 'ค่าเริ่มต้น',
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
