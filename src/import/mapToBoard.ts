/**
 * Best-effort mapping of pasted/uploaded text or JSON onto the board.
 * - Full Plotline project JSON → replace-ready Project
 * - Loose JSON (scenes array / objects / strings) → SceneSuggestions
 * - Free prose → localParser
 */

import { parseProject } from '../domain/schemas'
import type { Project } from '../domain/types'
import type { ArcRelation, Backstory, StoryPhase } from '../domain/types'
import { STORY_PHASES } from '../domain/types'
import type { ParseResponse, SceneSuggestion } from './AIParserAdapter'
import { localParser } from './localParser'

export type MappedImport =
  | {
      kind: 'project'
      project: Project
      warnings: string[]
    }
  | {
      kind: 'scenes'
      scenes: SceneSuggestion[]
      backstory: Partial<Backstory>
      warnings: string[]
      source: 'json' | 'text'
    }

function asTrimmedString(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return ''
}

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    if (key in obj) {
      const s = asTrimmedString(obj[key])
      if (s) return s
    }
  }
  // case-insensitive fallback
  const lowerMap = new Map(
    Object.keys(obj).map((k) => [k.toLowerCase(), k] as const),
  )
  for (const key of keys) {
    const real = lowerMap.get(key.toLowerCase())
    if (!real) continue
    const s = asTrimmedString(obj[real])
    if (s) return s
  }
  return ''
}

function pickCharacters(obj: Record<string, unknown>): string[] {
  const raw =
    obj.characters ?? obj.cast ?? obj.character ?? obj['ตัวละคร'] ?? obj.people
  if (Array.isArray(raw)) {
    return raw.map((x) => asTrimmedString(x)).filter(Boolean)
  }
  const s = asTrimmedString(raw)
  if (!s) return []
  return s
    .split(/[,،、/]|และ/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function mapPhase(raw: string, index: number, total: number): StoryPhase {
  const t = raw.toLowerCase().trim()
  if (!t) return inferPhaseByIndex(index, total)
  if (STORY_PHASES.includes(t as StoryPhase)) return t as StoryPhase
  if (
    t.includes('setup') ||
    t.includes('เริ่ม') ||
    t === '1' ||
    t === 'act 1' ||
    t === 'act1'
  ) {
    return 'setup'
  }
  if (
    t.includes('early') ||
    t.includes('rising') ||
    t.includes('ช่วงแรก') ||
    t.includes('fun') ||
    t === '2' ||
    t === 'act 2' ||
    t === 'act2'
  ) {
    return 'early'
  }
  if (
    t.includes('middle') ||
    t.includes('mid') ||
    t.includes('ช่วงกลาง') ||
    t.includes('confrontation') ||
    t === '3'
  ) {
    return 'middle'
  }
  if (
    t.includes('ending') ||
    t.includes('climax') ||
    t.includes('ช่วงท้าย') ||
    t.includes('resolution') ||
    t.includes('finale') ||
    t === '4' ||
    t === 'act 3' ||
    t === 'act3'
  ) {
    return 'ending'
  }
  return inferPhaseByIndex(index, total)
}

function inferPhaseByIndex(index: number, total: number): StoryPhase {
  if (total <= 1) return 'setup'
  const bucket = Math.min(
    STORY_PHASES.length - 1,
    Math.floor((index / total) * STORY_PHASES.length),
  )
  return STORY_PHASES[bucket]
}

function mapArc(raw: string): ArcRelation {
  const t = raw.toLowerCase()
  if (t.includes('ghost') || t.includes('โกสต์') || t.includes('บาดแผล')) {
    return 'ghost'
  }
  if (t.includes('need') || t.includes('เรียนรู้')) return 'need'
  if (t.includes('lie') || t.includes('โกหก')) return 'lie'
  if (t.includes('want') || t.includes('อยาก')) return 'want'
  return 'neutral'
}

function firstSentence(text: string): string {
  const line = text.split(/\n/)[0]?.trim() ?? ''
  const clipped = line.split(/(?<=[.!?。ๆ])\s/)[0] ?? line
  return clipped.length > 48 ? `${clipped.slice(0, 48)}…` : clipped || 'ฉากใหม่'
}

function mapOneScene(
  raw: unknown,
  index: number,
  total: number,
): SceneSuggestion | null {
  if (typeof raw === 'string') {
    const action = raw.trim()
    if (!action) return null
    return {
      id: `json-${index}`,
      title: firstSentence(action),
      location: '',
      characters: [],
      characterGoal: '',
      action,
      obstacle: '',
      outcome: '',
      changeAfterScene: '',
      phase: inferPhaseByIndex(index, total),
      arcRelation: 'neutral',
      confidence: 0.5,
      sourceRange: [0, 0],
    }
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const obj = raw as Record<string, unknown>

  const title = pickString(obj, [
    'title',
    'name',
    'heading',
    'label',
    'ชื่อ',
    'ชื่อฉาก',
  ])
  const action = pickString(obj, [
    'action',
    'summary',
    'description',
    'body',
    'text',
    'content',
    'prose',
    'เนื้อหา',
    'เรื่อง',
    'การกระทำ',
  ])
  const location = pickString(obj, [
    'location',
    'place',
    'setting',
    'สถานที่',
  ])
  const characterGoal = pickString(obj, [
    'characterGoal',
    'goal',
    'เป้าหมาย',
  ])
  const obstacle = pickString(obj, ['obstacle', 'conflict', 'อุปสรรค'])
  const outcome = pickString(obj, ['outcome', 'result', 'ผลลัพธ์'])
  const changeAfterScene = pickString(obj, [
    'changeAfterScene',
    'change',
    'สิ่งที่เปลี่ยน',
  ])
  const phaseRaw = pickString(obj, ['phase', 'act', 'band', 'ช่วง'])
  const beat = pickString(obj, ['beat', 'บีต']) || undefined
  const arcRaw = pickString(obj, ['arcRelation', 'arc', 'relation'])

  if (!title && !action) return null

  const resolvedAction = action || title
  const resolvedTitle = title || firstSentence(resolvedAction)

  return {
    id: `json-${index}`,
    title: resolvedTitle,
    location,
    characters: pickCharacters(obj),
    characterGoal,
    action: resolvedAction,
    obstacle,
    outcome,
    changeAfterScene,
    phase: mapPhase(phaseRaw, index, total),
    beat,
    arcRelation: arcRaw ? mapArc(arcRaw) : 'neutral',
    confidence: 0.62,
    sourceRange: [0, 0],
  }
}

function extractBackstoryFromObject(
  obj: Record<string, unknown>,
): Partial<Backstory> {
  const backstory: Partial<Backstory> = {}
  const ghost = pickString(obj, ['ghost', 'โกสต์', 'บาดแผล'])
  const lie = pickString(obj, ['lie', 'คำโกหก'])
  const lieAtWork = pickString(obj, [
    'lieAtWork',
    'lie_at_work',
    'lie at work',
    'Lie at Work',
  ])
  const want = pickString(obj, ['want', 'ความอยาก', 'สิ่งที่ต้องการ'])
  const need = pickString(obj, ['need', 'สิ่งที่ต้องเรียนรู้'])
  if (ghost) backstory.ghost = ghost
  if (lie) backstory.lie = lie
  if (lieAtWork) backstory.lieAtWork = lieAtWork
  if (want) backstory.want = want
  if (need) backstory.need = need

  const nested = obj.backstory
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const nestedMap = extractBackstoryFromObject(
      nested as Record<string, unknown>,
    )
    return { ...backstory, ...nestedMap }
  }
  return backstory
}

function collectSceneCandidates(data: unknown): {
  items: unknown[]
  backstory: Partial<Backstory>
  warnings: string[]
} {
  const warnings: string[] = []
  if (Array.isArray(data)) {
    return { items: data, backstory: {}, warnings }
  }
  if (!data || typeof data !== 'object') {
    return { items: [], backstory: {}, warnings: ['JSON ไม่ใช่ object หรือ array'] }
  }
  const obj = data as Record<string, unknown>
  const backstory = extractBackstoryFromObject(obj)

  for (const key of [
    'scenes',
    'cards',
    'chapters',
    'beats',
    'nodes',
    'items',
    'ฉาก',
  ]) {
    const value = obj[key]
    if (Array.isArray(value)) {
      return { items: value, backstory, warnings }
    }
  }

  // Single scene-shaped object
  if (
    pickString(obj, ['title', 'name', 'action', 'summary', 'description', 'text'])
  ) {
    return { items: [obj], backstory, warnings }
  }

  warnings.push('ไม่พบ array ฉากใน JSON — ลองใช้คีย์ scenes / chapters')
  return { items: [], backstory, warnings }
}

function mapJsonToScenes(data: unknown): ParseResponse & { warnings: string[] } {
  const { items, backstory, warnings } = collectSceneCandidates(data)
  const scenes = items
    .map((item, i) => mapOneScene(item, i, items.length))
    .filter((s): s is SceneSuggestion => s !== null)

  if (items.length > 0 && scenes.length === 0) {
    warnings.push('มีรายการใน JSON แต่แมปเป็นฉากไม่ได้')
  }
  return { scenes, backstory, warnings }
}

/**
 * Classify raw clipboard/file contents and map onto board-ready structures.
 */
export async function mapRawToBoard(raw: string): Promise<MappedImport> {
  const text = raw.trim()
  if (!text) {
    return {
      kind: 'scenes',
      scenes: [],
      backstory: {},
      warnings: ['ไม่มีข้อความให้นำเข้า'],
      source: 'text',
    }
  }

  // Prefer JSON when it parses — including Plotline project files.
  if (
    (text.startsWith('{') && text.endsWith('}')) ||
    (text.startsWith('[') && text.endsWith(']'))
  ) {
    try {
      const data = JSON.parse(text) as unknown
      const asProject = parseProject(data)
      if (asProject.ok && asProject.project) {
        return {
          kind: 'project',
          project: asProject.project,
          warnings: [],
        }
      }

      const mapped = mapJsonToScenes(data)
      if (mapped.scenes.length > 0) {
        return {
          kind: 'scenes',
          scenes: mapped.scenes,
          backstory: mapped.backstory,
          warnings: [
            ...(asProject.ok ? [] : [`ไม่ใช่โปรเจกต์ Plotline เต็มรูปแบบ — แมปเป็นฉากแทน`]),
            ...mapped.warnings,
          ].filter(Boolean),
          source: 'json',
        }
      }

      // JSON but no scenes — fall through to text parser on stringified? better warn
      const prose = await localParser.parse(text)
      return {
        kind: 'scenes',
        scenes: prose.scenes,
        backstory: { ...mapped.backstory, ...prose.backstory },
        warnings: [
          'JSON แมปเป็นฉากไม่ได้ — ลองแยกเป็นข้อความแทน',
          ...mapped.warnings,
        ],
        source: 'text',
      }
    } catch {
      // not valid JSON — treat as prose
    }
  }

  const parsed = await localParser.parse(text)
  return {
    kind: 'scenes',
    scenes: parsed.scenes,
    backstory: parsed.backstory,
    warnings:
      parsed.scenes.length === 0
        ? ['แยกฉากจากข้อความไม่ได้ — ลองเว้นบรรทัดว่างระหว่างฉาก']
        : [],
    source: 'text',
  }
}

/** Read a text/json file as UTF-8 string. */
export function readImportFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'))
    reader.readAsText(file)
  })
}
