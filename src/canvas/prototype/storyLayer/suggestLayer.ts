/**
 * PROTOTYPE — throwaway lane suggest rules (not production).
 */

export type StoryLayer = 'meta' | 'character' | 'memory' | 'ghost'

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

export type SampleScene = {
  id: string
  title: string
  arcRelation: string
  beat?: string
  action: string
  notes?: string
  layer: StoryLayer | null
  userSet?: boolean
}

export type LayerSuggestion = {
  layer: StoryLayer
  reason: string
  confidence: 'high' | 'medium' | 'low'
}

/** Prototype-only suggest — not authoritative. */
export function suggestLayer(scene: SampleScene): LayerSuggestion {
  if (scene.arcRelation === 'ghost') {
    return {
      layer: 'ghost',
      reason: 'จากแท็ก Ghost',
      confidence: 'high',
    }
  }
  if (scene.notes?.toUpperCase().includes('META')) {
    return {
      layer: 'meta',
      reason: 'จากโน้ต META',
      confidence: 'high',
    }
  }
  const memHint =
    /ความทรงจำ|ย้อน|flashback|วัยเด็ก/i.test(
      `${scene.title} ${scene.action}`,
    )
  if (memHint) {
    return {
      layer: 'memory',
      reason: 'จากข้อความฉาก (memory hint)',
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
    reason: 'ค่าเริ่มต้น — ยังไม่มั่นใจ',
    confidence: 'low',
  }
}

export const SAMPLE_SCENES: SampleScene[] = [
  {
    id: 's1',
    title: 'แอลเปิดสมุดวันแรก',
    arcRelation: 'want',
    beat: 'catalyst',
    action: 'เขียนชื่อคิวลงหน้าแรก',
    layer: 'character',
  },
  {
    id: 's2',
    title: 'แผลรุ่นพี่กลับมา',
    arcRelation: 'ghost',
    action: 'เห็นรูปเก่าแล้วหยุดเขียน',
    layer: null,
  },
  {
    id: 's3',
    title: 'เล่า 18 วัน',
    arcRelation: 'neutral',
    action: 'ผู้เล่าบอกว่าทุกอย่างผ่านไปแล้ว',
    notes: 'META — กรอบการเล่า',
    layer: null,
  },
  {
    id: 's4',
    title: 'วัยเด็กที่ร้าน',
    arcRelation: 'neutral',
    action: 'ย้อนไปวัยเด็ก ยืนรอผู้หญิงคนนั้น',
    layer: null,
  },
]
