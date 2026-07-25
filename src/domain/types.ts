// Pure domain types — no React / framework dependencies.

export type StoryPhase = 'setup' | 'early' | 'middle' | 'ending'

export const STORY_PHASES: StoryPhase[] = ['setup', 'early', 'middle', 'ending']

export const PHASE_LABELS: Record<StoryPhase, string> = {
  setup: '1. เริ่มต้น',
  early: '2. ช่วงแรก',
  middle: '3. ช่วงกลาง',
  ending: '4. ช่วงท้าย',
}

/**
 * A story beat is identified by the key of a beat in the selected structure
 * template (see domain/structure.ts, which owns the labels, positions and
 * marker styling). Kept as a plain string so each template can define its own
 * vocabulary — Save the Cat's `all_is_lost` and Kishōtenketsu's `ten` are as
 * valid as the 4-Phase `midpoint`.
 */
export type BeatKey = string

export type ArcRelation =
  | 'ghost'
  | 'lie'
  | 'lie_at_work'
  | 'want'
  | 'need'
  | 'neutral'

export const ARC_RELATION_LABELS: Record<ArcRelation, string> = {
  ghost: 'Ghost',
  lie: 'Lie',
  lie_at_work: 'Lie at Work',
  want: 'Want',
  need: 'Need',
  neutral: 'Neutral',
}

// Arc relations that pull a scene above the paradigm line (Lie/Want driven).
export const ABOVE_LINE_RELATIONS: ArcRelation[] = ['lie', 'lie_at_work', 'want']

// The horizontal paradigm line sits at y = 0. Above = negative, below = positive.
export const PARADIGM_LINE_Y = 0

export type StoryLayer = 'meta' | 'character' | 'memory' | 'ghost'

export interface Position {
  x: number
  y: number
}

export interface StoryScene {
  id: string
  title: string
  location: string
  characters: string[]
  povCharacter?: string
  characterGoal: string
  action: string
  /** External pressure in this scene (คน / สถานการณ์ / โลก). */
  obstacle: string
  /** Internal pressure in this scene (กลัว / ยึด Lie / ไม่กล้ารับ Need). */
  internalConflict: string
  outcome: string
  changeAfterScene: string
  /** Legacy 4-phase shadow, kept so older saved projects keep round-tripping.
   *  The band a scene reads as now comes from its x under the selected
   *  structure template, not from this field. */
  phase: StoryPhase
  beat?: BeatKey
  arcRelation: ArcRelation
  /** Y-lane on layered-memory boards (default CHARACTER). */
  storyLayer: StoryLayer
  /** Telling chapter (a single letter A/B/C…). Scenes that share a letter are
   *  narrated together; chapter order (A→B→C) is the telling order, which can
   *  differ from chronological order on the paradigm line. Undefined = unassigned. */
  tellingChapter?: string
  position: Position
  color?: string
  order: number
  notes: string
  collapsed: boolean
  locked: boolean
}

export interface BeatMarker {
  id: string
  type: BeatKey
  title: string
  description: string
  position: Position
  locked: boolean
}

export type EdgeType =
  | 'actual_path'
  | 'expected_want_path'
  | 'better_outcome_path'
  | 'failure_path'
  | 'character_arc'

export const EDGE_LABELS: Record<EdgeType, string> = {
  actual_path: 'เหตุการณ์จริง',
  expected_want_path: 'เส้นทาง Want ที่คาดหวัง',
  better_outcome_path: 'เส้นทางสู่สิ่งที่ดีกว่า / Need',
  failure_path: 'ความล้มเหลว / ไม่ได้ Want',
  character_arc: 'เส้นทาง Character Arc',
}

export interface StoryEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  type: EdgeType
  label?: string
}

export interface Backstory {
  ghost: string
  lie: string
  lieAtWork: string
  want: string
  need: string
}

/** A named character in the story. Scenes reference characters by name
 *  (scene.characters stays string[]), so the roster is a helper layer:
 *  it supplies colour, arc notes, and quick assignment — not a hard FK.
 *  Project-level `Backstory` stays the story spine; per-character fields
 *  hold Ghost/Lie/Want/Need for multi-POV or antagonist planning. */
export interface Character {
  id: string
  name: string
  color: string
  ghost: string
  lie: string
  lieAtWork: string
  want: string
  need: string
}

/** Roster colours drawn from the board palette (name + colour together on chips,
 *  so colour is never the only signal). */
export const CHARACTER_COLORS = [
  '#e49c4e', // amber
  '#3d4dec', // indigo
  '#2f9c6c', // mint-deep
  '#cd5042', // rust
  '#8a6fb3', // soft violet
  '#4b4a45', // ink-soft
]

export type WantOutcome = 'got' | 'not_got' | 'got_better'
export type NeedOutcome = 'gained' | 'rejected' | 'understood_not_yet'

export const WANT_OUTCOME_LABELS: Record<WantOutcome, string> = {
  got: 'ได้ Want',
  not_got: 'ไม่ได้ Want',
  got_better: 'ได้สิ่งที่ดีกว่า',
}

export const NEED_OUTCOME_LABELS: Record<NeedOutcome, string> = {
  gained: 'ได้รับ Need',
  rejected: 'ปฏิเสธ Need',
  understood_not_yet: 'เข้าใจ Need แต่ยังทำไม่ได้',
}

export interface ClimaxOutcome {
  want: WantOutcome
  need: NeedOutcome
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface Project {
  schemaVersion: number
  id: string
  title: string
  backstory: Backstory
  scenes: StoryScene[]
  beats: BeatMarker[]
  edges: StoryEdge[]
  climaxOutcome: ClimaxOutcome
  /** id of the selected vertical structure overlay (see domain/structure.ts). */
  structureTemplateId: string
  /** Ordered telling-chapter keys; display letters (A/B/C…) derive from position.
   *  Empty = derive order from scene keys (see domain/telling.ts). */
  tellingChapterOrder: string[]
  /** Named character roster (see Character). */
  characters: Character[]
  /** One-paragraph synopsis / spine of the whole story. */
  synopsis: string
  /** Per-telling-chapter narration notes, keyed by chapter key (see telling.ts). */
  tellingChapterNotes: Record<string, string>
  viewport: Viewport
  updatedAt: string
}
