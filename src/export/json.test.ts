import { describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import { projectFromJson, projectToJson } from './json'

describe('JSON export/import', () => {
  it('round-trips a project, preserving node positions', () => {
    const project = createSeedProject()
    project.scenes[0].position = { x: 1234, y: -567 }

    const json = projectToJson(project)
    const result = projectFromJson(json)

    expect(result.ok).toBe(true)
    expect(result.project?.scenes[0].position).toEqual({ x: 1234, y: -567 })
    expect(result.project?.edges).toHaveLength(project.edges.length)
    expect(result.project?.backstory).toEqual(project.backstory)
    expect(result.project?.viewport).toEqual(project.viewport)
  })

  it('returns an error for invalid JSON', () => {
    const result = projectFromJson('{ not valid')
    expect(result.ok).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns an error for a well-formed but invalid project', () => {
    const result = projectFromJson(JSON.stringify({ title: 'x' }))
    expect(result.ok).toBe(false)
  })

  it('simulates move → export → import preserving the moved position', () => {
    // Move a scene, serialize, then reload.
    const project = createSeedProject()
    const climax = project.scenes.find((s) => s.id === 'scene-climax')!
    climax.position = { x: 2500, y: 333 }

    const reloaded = projectFromJson(projectToJson(project))
    const roundTripped = reloaded.project?.scenes.find(
      (s) => s.id === 'scene-climax',
    )
    expect(roundTripped?.position).toEqual({ x: 2500, y: 333 })
  })
})
