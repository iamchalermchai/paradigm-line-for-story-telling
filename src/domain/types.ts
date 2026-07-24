// Pure domain types — no React / framework dependencies.

export type StoryPhase = 'setup' | 'early' | 'middle' | 'ending'

export const STORY_PHASES: StoryPhase[] = ['setup', 'early', 'middle', 'ending']

export const PHASE_LABELS: Record<StoryPhase, string> = {
  setup: '1. เริ่มต้น',
  early: '2. ช่วงแรก',
  middle: '3. ช่วงกลาง',
  ending: '4. ช่วงท้าย',
}

export type StoryBeatType =
  | 'catalyst'
  | 'want'
  | 'progress'
  | 'warning'
  | 'midpoint'
  | 'low_point'
  | 'ghost'
  | 'aha'
  | 'choice'
  | 'climax'
  | 'ending'

export const BEAT_LABELS: Record<StoryBeatType, string> = {
  catalyst: 'Catalyst',
  want: 'Want',
  progress: 'Things Go Well',
  warning: 'Warning',
  midpoint: 'Midpoint',
  low_point: 'Low Point',
  ghost: 'Ghost',
  aha: 'Aha!',
  choice: 'Choice',
  climax: 'Climax',
  ending: 'Ending',
}

// Which phase a beat conventionally belongs to (used by validation + auto-layout).
export const BEAT_PHASE: Record<StoryBeatType, StoryPhase> = {
  catalyst: 'setup',
  want: 'early',
  progress: 'early',
  warning: 'early',
  midpoint: 'middle',
  low_point: 'middle',
  ghost: 'middle',
  aha: 'ending',
  choice: 'ending',
  climax: 'ending',
  ending: 'ending',
}

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
  obstacle: string
  outcome: string
  changeAfterScene: string
  phase: StoryPhase
  beat?: StoryBeatType
  arcRelation: ArcRelation
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
  type: StoryBeatType
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
  viewport: Viewport
  updatedAt: string
}
