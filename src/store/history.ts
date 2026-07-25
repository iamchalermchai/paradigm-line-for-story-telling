import type {
  Backstory,
  BeatMarker,
  Character,
  ClimaxOutcome,
  Project,
  StoryEdge,
  StoryScene,
} from '../domain/types'

// The slice of a project that undo/redo tracks. Viewport + metadata are
// intentionally excluded so panning around does not create history entries.
export interface HistorySnapshot {
  scenes: StoryScene[]
  beats: BeatMarker[]
  edges: StoryEdge[]
  backstory: Backstory
  climaxOutcome: ClimaxOutcome
  characters: Character[]
  synopsis: string
  tellingChapterNotes: Record<string, string>
  /** Tracked because switching structures swaps the beat markers: undoing the
   *  markers without the structure would leave the picker lying about them. */
  structureTemplateId: string
  laneMode: boolean
}

export function snapshot(project: Project): HistorySnapshot {
  return {
    scenes: project.scenes,
    beats: project.beats,
    edges: project.edges,
    backstory: project.backstory,
    climaxOutcome: project.climaxOutcome,
    characters: project.characters,
    synopsis: project.synopsis,
    tellingChapterNotes: project.tellingChapterNotes,
    structureTemplateId: project.structureTemplateId,
    laneMode: project.laneMode,
  }
}

export function applySnapshot(
  project: Project,
  snap: HistorySnapshot,
): Project {
  return {
    ...project,
    scenes: snap.scenes,
    beats: snap.beats,
    edges: snap.edges,
    backstory: snap.backstory,
    climaxOutcome: snap.climaxOutcome,
    characters: snap.characters,
    synopsis: snap.synopsis,
    tellingChapterNotes: snap.tellingChapterNotes,
    structureTemplateId: snap.structureTemplateId,
    laneMode: snap.laneMode,
    updatedAt: new Date().toISOString(),
  }
}

export const HISTORY_LIMIT = 100
