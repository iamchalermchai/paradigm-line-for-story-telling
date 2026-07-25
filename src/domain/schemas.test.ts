import { describe, expect, it } from 'vitest'
import { createSeedProject } from './seed'
import { parseProject, projectSchema, SCHEMA_VERSION } from './schemas'

describe('project schema', () => {
  it('validates the seed project', () => {
    const seed = createSeedProject()
    expect(projectSchema.safeParse(seed).success).toBe(true)
  })

  it('parseProject round-trips a serialized seed project', () => {
    const seed = createSeedProject()
    const json = JSON.parse(JSON.stringify(seed))
    const result = parseProject(json)
    expect(result.ok).toBe(true)
    expect(result.project?.title).toBe(seed.title)
    expect(result.project?.scenes).toHaveLength(seed.scenes.length)
  })

  it('rejects a malformed project and returns an error string', () => {
    const result = parseProject({ schemaVersion: 1, title: 123 })
    expect(result.ok).toBe(false)
    expect(typeof result.error).toBe('string')
  })

  it('migrates a version-0 payload up to the current version', () => {
    const seed = createSeedProject()
    const legacy = { ...JSON.parse(JSON.stringify(seed)), schemaVersion: 0 }
    const result = parseProject(legacy)
    expect(result.ok).toBe(true)
    expect(result.project?.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('migrates a v1 payload without structureTemplateId, defaulting it', () => {
    const seed = createSeedProject()
    const v1: Record<string, unknown> = {
      ...JSON.parse(JSON.stringify(seed)),
      schemaVersion: 1,
    }
    delete v1.structureTemplateId
    const result = parseProject(v1)
    expect(result.ok).toBe(true)
    expect(result.project?.structureTemplateId).toBe('four-phase')
    expect(result.project?.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('migrates a v2 payload, keeping its 4-Phase beat tags intact', () => {
    const seed = createSeedProject()
    const v2 = { ...JSON.parse(JSON.stringify(seed)), schemaVersion: 2 }
    const result = parseProject(v2)
    expect(result.ok).toBe(true)
    expect(result.project?.schemaVersion).toBe(SCHEMA_VERSION)
    expect(result.project?.beats.map((b) => b.type)).toEqual(
      seed.beats.map((b) => b.type),
    )
    expect(result.project?.scenes.find((s) => s.id === 'scene-want')?.beat).toBe(
      'want',
    )
  })

  it('accepts beat keys from a non-default structure', () => {
    const seed = createSeedProject()
    const raw = JSON.parse(JSON.stringify(seed))
    raw.structureTemplateId = 'kishotenketsu'
    raw.beats[0].type = 'ten'
    raw.scenes[0].beat = 'ketsu'
    const result = parseProject(raw)
    expect(result.ok).toBe(true)
    expect(result.project?.beats[0].type).toBe('ten')
    expect(result.project?.scenes[0].beat).toBe('ketsu')
  })

  it('defaults missing internalConflict on older scene payloads', () => {
    const seed = createSeedProject()
    const raw = JSON.parse(JSON.stringify(seed))
    for (const s of raw.scenes) delete s.internalConflict
    const result = parseProject(raw)
    expect(result.ok).toBe(true)
    expect(
      result.project?.scenes.every((s) => typeof s.internalConflict === 'string'),
    ).toBe(true)
  })
})
