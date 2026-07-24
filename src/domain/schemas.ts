import { z } from 'zod'
import { DEFAULT_STRUCTURE_ID } from './structure'
import type { Project } from './types'

export const SCHEMA_VERSION = 2

export const storyPhaseSchema = z.enum([
  'setup',
  'early',
  'middle',
  'ending',
])

export const storyBeatTypeSchema = z.enum([
  'catalyst',
  'want',
  'progress',
  'warning',
  'midpoint',
  'low_point',
  'ghost',
  'aha',
  'choice',
  'climax',
  'ending',
])

export const arcRelationSchema = z.enum([
  'ghost',
  'lie',
  'lie_at_work',
  'want',
  'need',
  'neutral',
])

export const edgeTypeSchema = z.enum([
  'actual_path',
  'expected_want_path',
  'better_outcome_path',
  'failure_path',
  'character_arc',
])

export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

export const storySceneSchema = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string(),
  characters: z.array(z.string()),
  povCharacter: z.string().optional(),
  characterGoal: z.string(),
  action: z.string(),
  obstacle: z.string(),
  outcome: z.string(),
  changeAfterScene: z.string(),
  phase: storyPhaseSchema,
  beat: storyBeatTypeSchema.optional(),
  arcRelation: arcRelationSchema,
  tellingChapter: z.string().optional(),
  position: positionSchema,
  color: z.string().optional(),
  order: z.number(),
  notes: z.string(),
  collapsed: z.boolean(),
  locked: z.boolean(),
})

export const beatMarkerSchema = z.object({
  id: z.string(),
  type: storyBeatTypeSchema,
  title: z.string(),
  description: z.string(),
  position: positionSchema,
  locked: z.boolean(),
})

export const storyEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullish(),
  targetHandle: z.string().nullish(),
  type: edgeTypeSchema,
  label: z.string().optional(),
})

export const backstorySchema = z.object({
  ghost: z.string(),
  lie: z.string(),
  lieAtWork: z.string(),
  want: z.string(),
  need: z.string(),
})

export const climaxOutcomeSchema = z.object({
  want: z.enum(['got', 'not_got', 'got_better']),
  need: z.enum(['gained', 'rejected', 'understood_not_yet']),
})

export const viewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
})

export const projectSchema = z.object({
  schemaVersion: z.number(),
  id: z.string(),
  title: z.string(),
  backstory: backstorySchema,
  scenes: z.array(storySceneSchema),
  beats: z.array(beatMarkerSchema),
  edges: z.array(storyEdgeSchema),
  climaxOutcome: climaxOutcomeSchema,
  structureTemplateId: z.string().default(DEFAULT_STRUCTURE_ID),
  viewport: viewportSchema,
  updatedAt: z.string(),
})

export type ProjectInput = z.infer<typeof projectSchema>

/**
 * Migrate a raw parsed object of an unknown/older schema version up to the
 * current version. Kept as an explicit switch so future migrations slot in.
 */
function migrate(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw
  const obj = raw as Record<string, unknown>
  const version =
    typeof obj.schemaVersion === 'number' ? obj.schemaVersion : 0

  let migrated = obj
  let v = version

  if (v < 1) {
    migrated = { ...migrated, schemaVersion: 1 }
    v = 1
  }
  if (v < 2) {
    // v2 adds a selectable vertical structure overlay.
    migrated = {
      ...migrated,
      structureTemplateId:
        typeof migrated.structureTemplateId === 'string'
          ? migrated.structureTemplateId
          : DEFAULT_STRUCTURE_ID,
      schemaVersion: 2,
    }
    v = 2
  }

  return migrated
}

export interface ParseResult {
  ok: boolean
  project?: Project
  error?: string
}

/**
 * Validate + migrate an untrusted project payload (e.g. imported JSON or a
 * value read from localStorage). Never throws.
 */
export function parseProject(raw: unknown): ParseResult {
  const migrated = migrate(raw)
  const result = projectSchema.safeParse(migrated)
  if (!result.success) {
    return { ok: false, error: z.prettifyError(result.error) }
  }
  return { ok: true, project: result.data as Project }
}
