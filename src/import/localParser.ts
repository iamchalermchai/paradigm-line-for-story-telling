import type { ArcRelation, Backstory, StoryPhase } from '../domain/types'
import { STORY_PHASES } from '../domain/types'
import type {
  AIParserAdapter,
  ParseResponse,
  SceneSuggestion,
} from './AIParserAdapter'

interface Block {
  text: string
  start: number
  end: number
}

/** Split prose into paragraph blocks, tracking source character offsets. */
export function splitBlocks(text: string): Block[] {
  const blocks: Block[] = []
  const parts = text.split(/\n\s*\n/)
  let cursor = 0
  for (const raw of parts) {
    const trimmed = raw.trim()
    if (!trimmed) {
      cursor += raw.length + 2
      continue
    }
    const start = text.indexOf(trimmed, cursor)
    const safeStart = start >= 0 ? start : cursor
    const end = safeStart + trimmed.length
    cursor = end
    blocks.push({ text: trimmed, start: safeStart, end })
  }
  return blocks
}

const ARC_KEYWORDS: [ArcRelation, string[]][] = [
  ['ghost', ['อดีต', 'รุ่นพี่', 'ความทรงจำ', 'ย้อน', 'บาดแผล', 'ghost']],
  ['need', ['เข้าใจ', 'ยอมรับ', 'กล้า', 'เชื่อมต่อ', 'เรียนรู้', 'need']],
  ['lie', ['เงียบ', 'ตัดขาด', 'ป้องกัน', 'หนี', 'กลัว', 'lie']],
  ['want', ['อยาก', 'ตั้งใจ', 'ต้องการ', 'เขียน', 'พยายาม', 'want']],
]

function inferArcRelation(text: string): ArcRelation {
  const lower = text.toLowerCase()
  for (const [relation, words] of ARC_KEYWORDS) {
    if (words.some((w) => lower.includes(w.toLowerCase()))) return relation
  }
  return 'neutral'
}

function inferPhase(index: number, total: number): StoryPhase {
  if (total <= 1) return 'setup'
  const fraction = index / total
  const bucket = Math.min(
    STORY_PHASES.length - 1,
    Math.floor(fraction * STORY_PHASES.length),
  )
  return STORY_PHASES[bucket]
}

const BACKSTORY_LINE =
  /^(ghost|lie at work|lie_at_work|lie|want|need|โกสต์|บาดแผล|คำโกหก|lie ที่ทำงาน|ความอยาก|สิ่งที่ต้องการ|สิ่งที่ต้องเรียนรู้)\s*[:：]\s*(.+)$/i

const FIELD_LINE =
  /^(title|ชื่อ|ชื่อฉาก|location|สถานที่|characters?|ตัวละคร|goal|เป้าหมาย|action|การกระทำ|obstacle|อุปสรรค|outcome|ผลลัพธ์|change|สิ่งที่เปลี่ยน|beat|บีต)\s*[:：]\s*(.+)$/i

function extractBackstory(text: string): {
  backstory: Partial<Backstory>
  stripped: string
} {
  const backstory: Partial<Backstory> = {}
  const kept: string[] = []
  for (const line of text.split(/\n/)) {
    const m = line.trim().match(BACKSTORY_LINE)
    if (!m) {
      kept.push(line)
      continue
    }
    const keyRaw = m[1].toLowerCase()
    const value = m[2].trim()
    if (keyRaw === 'ghost' || keyRaw === 'โกสต์' || keyRaw === 'บาดแผล') {
      backstory.ghost = value
    } else if (
      keyRaw === 'lie at work' ||
      keyRaw === 'lie_at_work' ||
      keyRaw === 'lie ที่ทำงาน'
    ) {
      backstory.lieAtWork = value
    } else if (keyRaw === 'lie' || keyRaw === 'คำโกหก') {
      backstory.lie = value
    } else if (
      keyRaw === 'want' ||
      keyRaw === 'ความอยาก' ||
      keyRaw === 'สิ่งที่ต้องการ'
    ) {
      backstory.want = value
    } else if (keyRaw === 'need' || keyRaw === 'สิ่งที่ต้องเรียนรู้') {
      backstory.need = value
    } else {
      kept.push(line)
    }
  }
  return { backstory, stripped: kept.join('\n') }
}

function parseSceneFields(block: string): Partial<SceneSuggestion> & {
  body: string
} {
  const fields: Record<string, string> = {}
  const bodyLines: string[] = []
  for (const line of block.split(/\n/)) {
    const m = line.trim().match(FIELD_LINE)
    if (!m) {
      bodyLines.push(line)
      continue
    }
    const key = m[1].toLowerCase()
    const value = m[2].trim()
    if (key === 'title' || key === 'ชื่อ' || key === 'ชื่อฉาก') fields.title = value
    else if (key === 'location' || key === 'สถานที่') fields.location = value
    else if (key === 'character' || key === 'characters' || key === 'ตัวละคร') {
      fields.characters = value
    } else if (key === 'goal' || key === 'เป้าหมาย') fields.characterGoal = value
    else if (key === 'action' || key === 'การกระทำ') fields.action = value
    else if (key === 'obstacle' || key === 'อุปสรรค') fields.obstacle = value
    else if (key === 'outcome' || key === 'ผลลัพธ์') fields.outcome = value
    else if (key === 'change' || key === 'สิ่งที่เปลี่ยน') {
      fields.changeAfterScene = value
    } else if (key === 'beat' || key === 'บีต') fields.beat = value
  }
  return {
    title: fields.title,
    location: fields.location,
    characters: fields.characters
      ? fields.characters.split(/[,،、/]|และ/).map((s) => s.trim()).filter(Boolean)
      : undefined,
    characterGoal: fields.characterGoal,
    action: fields.action,
    obstacle: fields.obstacle,
    outcome: fields.outcome,
    changeAfterScene: fields.changeAfterScene,
    beat: fields.beat,
    body: bodyLines.join('\n').trim(),
  }
}

function firstSentence(text: string): string {
  const line = text.split(/\n/)[0].trim()
  const clipped = line.split(/(?<=[.!?。ๆ])\s/)[0] ?? line
  return clipped.length > 48 ? `${clipped.slice(0, 48)}…` : clipped
}

function isBackstoryOnlyBlock(text: string): boolean {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean)
  return lines.length > 0 && lines.every((l) => BACKSTORY_LINE.test(l))
}

/**
 * Deterministic offline Scene Bank parser: labelled backstory + paragraph
 * scenes, optional per-scene field lines (Title:/Action:/…), Thai or English.
 */
export const localParser: AIParserAdapter = {
  name: 'local',
  async parse(text: string): Promise<ParseResponse> {
    const { backstory, stripped } = extractBackstory(text)
    const blocks = splitBlocks(stripped).filter(
      (b) => !isBackstoryOnlyBlock(b.text),
    )
    const total = blocks.length

    const scenes: SceneSuggestion[] = blocks.map((block, i) => {
      const fields = parseSceneFields(block.text)
      const prose = fields.body || block.text
      const action = fields.action?.trim() || prose
      const title = fields.title?.trim() || firstSentence(prose || action)
      const arcRelation = inferArcRelation(`${title}\n${action}`)
      const isFirst = i === 0
      const isLast = i === total - 1
      const beat =
        fields.beat?.trim() ||
        (isFirst
          ? 'catalyst'
          : isLast
            ? 'climax'
            : i === Math.floor(total / 2)
              ? 'midpoint'
              : undefined)

      return {
        id: `suggestion-${i}`,
        title,
        location: fields.location ?? '',
        characters: fields.characters ?? [],
        characterGoal: fields.characterGoal ?? '',
        action,
        obstacle: fields.obstacle ?? '',
        outcome: fields.outcome ?? '',
        changeAfterScene: fields.changeAfterScene ?? '',
        phase: inferPhase(i, total),
        beat,
        arcRelation,
        confidence: arcRelation === 'neutral' ? 0.55 : 0.78,
        sourceRange: [block.start, block.end],
      }
    })

    return { backstory, scenes }
  },
}

/** @deprecated Prefer localParser — kept so older imports keep working. */
export const mockParser = localParser
