import type {
  ArcRelation,
  Backstory,
  BeatKey,
  StoryPhase,
} from '../domain/types'

/** A single scene the parser believes it found in the source text. */
export interface SceneSuggestion {
  id: string
  title: string
  location: string
  characters: string[]
  characterGoal: string
  action: string
  obstacle: string
  internalConflict: string
  outcome: string
  changeAfterScene: string
  phase: StoryPhase
  beat?: BeatKey
  arcRelation: ArcRelation
  confidence: number
  /** [start, end) character offsets in the source text. */
  sourceRange: [number, number]
}

export interface ParseResponse {
  backstory: Partial<Backstory>
  scenes: SceneSuggestion[]
}

/**
 * Adapter boundary for turning raw prose into structured suggestions.
 * The app ships a deterministic offline `localParser`; a future AI provider
 * can implement the same interface behind a server endpoint.
 */
export interface AIParserAdapter {
  readonly name: string
  parse(text: string): Promise<ParseResponse>
}
