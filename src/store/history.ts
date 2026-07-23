import type {
  Backstory,
  BeatMarker,
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
}

export function snapshot(project: Project): HistorySnapshot {
  return {
    scenes: project.scenes,
    beats: project.beats,
    edges: project.edges,
    backstory: project.backstory,
    climaxOutcome: project.climaxOutcome,
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
    updatedAt: new Date().toISOString(),
  }
}

export const HISTORY_LIMIT = 100
