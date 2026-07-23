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
})
