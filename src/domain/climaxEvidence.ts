import type { Project, StoryEdge, StoryScene } from './types'

const CLIMAX_BEATS = new Set([
  'climax',
  'finale',
  'resurrection',
  'ordeal',
])

const WANT_EDGE = 'expected_want_path'
const NEED_EDGE = 'better_outcome_path'
const FAIL_EDGE = 'failure_path'

export interface ClimaxEvidence {
  climaxScenes: StoryScene[]
  wantIntoClimax: StoryEdge[]
  needIntoClimax: StoryEdge[]
  failIntoClimax: StoryEdge[]
  /** True when the board has at least one climax-tagged scene. */
  hasClimaxScene: boolean
  /** True when Want/Need/failure paths touch a climax scene. */
  hasArcEdges: boolean
}

/** Gather board proof that supports (or contradicts) the climax outcome picks. */
export function climaxEvidence(project: Project): ClimaxEvidence {
  const climaxScenes = project.scenes.filter(
    (s) => s.beat !== undefined && CLIMAX_BEATS.has(s.beat),
  )
  const climaxIds = new Set(climaxScenes.map((s) => s.id))

  const into = (type: string) =>
    project.edges.filter(
      (e) => e.type === type && climaxIds.has(e.target),
    )

  const wantIntoClimax = into(WANT_EDGE)
  const needIntoClimax = into(NEED_EDGE)
  const failIntoClimax = into(FAIL_EDGE)

  return {
    climaxScenes,
    wantIntoClimax,
    needIntoClimax,
    failIntoClimax,
    hasClimaxScene: climaxScenes.length > 0,
    hasArcEdges:
      wantIntoClimax.length + needIntoClimax.length + failIntoClimax.length > 0,
  }
}
