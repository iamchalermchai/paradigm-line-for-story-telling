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

// Order matters: a paragraph may hit several buckets, so the more decisive
// arc signals (ghost wound, need realization, lie/avoidance) are checked before
// the generic "want" verbs.
const ARC_KEYWORDS: [ArcRelation, string[]][] = [
  ['ghost', ['อดีต', 'รุ่นพี่', 'ความทรงจำ', 'ย้อน', 'บาดแผล']],
  ['need', ['เข้าใจ', 'ยอมรับ', 'กล้า', 'เชื่อมต่อ', 'เรียนรู้']],
  ['lie', ['เงียบ', 'ตัดขาด', 'ป้องกัน', 'หนี', 'กลัว']],
  ['want', ['อยาก', 'ตั้งใจ', 'ต้องการ', 'เขียน', 'พยายาม']],
]

function inferArcRelation(text: string): ArcRelation {
  for (const [relation, words] of ARC_KEYWORDS) {
    if (words.some((w) => text.includes(w))) return relation
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

function firstSentence(text: string): string {
  const line = text.split(/\n/)[0].trim()
  const clipped = line.split(/(?<=[.!?。ๆ])\s/)[0] ?? line
  return clipped.length > 48 ? `${clipped.slice(0, 48)}…` : clipped
}

const BACKSTORY_PATTERNS: [keyof Backstory, RegExp][] = [
  ['lieAtWork', /^(lie at work|lie_at_work)\s*[:：]\s*(.+)$/im],
  ['ghost', /^ghost\s*[:：]\s*(.+)$/im],
  ['lie', /^lie\s*[:：]\s*(.+)$/im],
  ['want', /^want\s*[:：]\s*(.+)$/im],
  ['need', /^need\s*[:：]\s*(.+)$/im],
]

function extractBackstory(text: string): Partial<Backstory> {
  const backstory: Partial<Backstory> = {}
  for (const [key, pattern] of BACKSTORY_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      backstory[key] = (match[2] ?? match[1]).trim()
    }
  }
  return backstory
}

/**
 * Deterministic offline parser: splits prose into paragraph "scenes", infers a
 * phase from position and an arc relation from keywords, and pulls out any
 * labelled backstory lines. Good enough to exercise the whole import flow
 * without an AI provider.
 */
export const mockParser: AIParserAdapter = {
  name: 'mock',
  async parse(text: string): Promise<ParseResponse> {
    const blocks = splitBlocks(text)
    const total = blocks.length

    const scenes: SceneSuggestion[] = blocks.map((block, i) => {
      const arcRelation = inferArcRelation(block.text)
      const isFirst = i === 0
      const isLast = i === total - 1
      const beat = isFirst
        ? 'catalyst'
        : isLast
          ? 'climax'
          : i === Math.floor(total / 2)
            ? 'midpoint'
            : undefined

      return {
        id: `suggestion-${i}`,
        title: firstSentence(block.text),
        location: '',
        characters: [],
        characterGoal: '',
        action: block.text,
        obstacle: '',
        outcome: '',
        changeAfterScene: '',
        phase: inferPhase(i, total),
        beat,
        arcRelation,
        confidence: arcRelation === 'neutral' ? 0.5 : 0.72,
        sourceRange: [block.start, block.end],
      }
    })

    return { backstory: extractBackstory(text), scenes }
  },
}
