import { beforeEach, describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import { loadProject } from './persistence'
import { useProjectStore } from './projectStore'

function reset() {
  localStorage.clear()
  useProjectStore.getState().importProject(createSeedProject())
  // importProject clears history; ensure a clean slate.
  useProjectStore.setState({ past: [], future: [] })
}

const store = () => useProjectStore.getState()

describe('projectStore', () => {
  beforeEach(reset)

  it('adds a scene with a unique id and increasing order', () => {
    const before = store().project.scenes.length
    const scene = store().addScene({ title: 'ทดสอบ' })
    expect(store().project.scenes).toHaveLength(before + 1)
    expect(scene.title).toBe('ทดสอบ')
    expect(scene.id).toBeTruthy()
  })

  it('updates a scene', () => {
    const scene = store().addScene()
    store().updateScene(scene.id, { title: 'แก้ไขแล้ว' })
    const found = store().project.scenes.find((s) => s.id === scene.id)
    expect(found?.title).toBe('แก้ไขแล้ว')
  })

  it('duplicates a scene with a new id', () => {
    const scene = store().addScene({ title: 'ต้นฉบับ' })
    const copy = store().duplicateScene(scene.id)
    expect(copy?.id).not.toBe(scene.id)
    expect(copy?.title).toContain('สำเนา')
  })

  it('deletes a scene and its connected edges', () => {
    const sceneId = 'scene-want'
    const hadEdges = store().project.edges.some(
      (e) => e.source === sceneId || e.target === sceneId,
    )
    expect(hadEdges).toBe(true)
    store().deleteScene(sceneId)
    expect(store().project.scenes.find((s) => s.id === sceneId)).toBeUndefined()
    expect(
      store().project.edges.some(
        (e) => e.source === sceneId || e.target === sceneId,
      ),
    ).toBe(false)
  })

  it('updates backstory', () => {
    store().updateBackstory({ ghost: 'ผีตัวใหม่' })
    expect(store().project.backstory.ghost).toBe('ผีตัวใหม่')
  })

  it('adds and deletes beats', () => {
    const beat = store().addBeat('midpoint')
    expect(store().project.beats.some((b) => b.id === beat.id)).toBe(true)
    store().deleteBeat(beat.id)
    expect(store().project.beats.some((b) => b.id === beat.id)).toBe(false)
  })

  it('adds an edge and avoids duplicates', () => {
    const before = store().project.edges.length
    store().addEdge({ source: 'scene-want', target: 'scene-aha', type: 'actual_path' })
    expect(store().project.edges).toHaveLength(before + 1)
    store().addEdge({ source: 'scene-want', target: 'scene-aha', type: 'actual_path' })
    expect(store().project.edges).toHaveLength(before + 1)
  })

  it('sets climax outcome', () => {
    store().setClimaxOutcome({ want: 'got', need: 'rejected' })
    expect(store().project.climaxOutcome).toEqual({ want: 'got', need: 'rejected' })
  })

  it('supports undo and redo', () => {
    const before = store().project.scenes.length
    store().addScene({ title: 'ชั่วคราว' })
    expect(store().project.scenes).toHaveLength(before + 1)
    expect(store().canUndo()).toBe(true)

    store().undo()
    expect(store().project.scenes).toHaveLength(before)

    store().redo()
    expect(store().project.scenes).toHaveLength(before + 1)
  })

  it('clears the redo stack after a new action', () => {
    store().addScene({ title: 'a' })
    store().undo()
    expect(store().canRedo()).toBe(true)
    store().addScene({ title: 'b' })
    expect(store().canRedo()).toBe(false)
  })

  it('moveScenes updates positions without breaking undo', () => {
    store().moveScenes([{ id: 'scene-want', position: { x: 10, y: 20 } }])
    const moved = store().project.scenes.find((s) => s.id === 'scene-want')
    expect(moved?.position).toEqual({ x: 10, y: 20 })
    store().undo()
    const reverted = store().project.scenes.find((s) => s.id === 'scene-want')
    expect(reverted?.position).not.toEqual({ x: 10, y: 20 })
  })

  it('applyAutoLayout repositions scenes and is undoable', () => {
    const original = { ...store().project.scenes.find((s) => s.id === 'scene-want')!.position }
    store().applyAutoLayout()
    store().undo()
    const reverted = store().project.scenes.find((s) => s.id === 'scene-want')
    expect(reverted?.position).toEqual(original)
  })

  it('persists to localStorage after a debounced save', async () => {
    store().addScene({ title: 'บันทึก' })
    await new Promise((r) => setTimeout(r, 700))
    const persisted = loadProject()
    expect(persisted?.scenes.some((s) => s.title === 'บันทึก')).toBe(true)
  })

  it('createProject starts an empty project', () => {
    store().createProject('เรื่องใหม่')
    expect(store().project.title).toBe('เรื่องใหม่')
    expect(store().project.scenes).toHaveLength(0)
  })

  it('exportProject returns the current project', () => {
    expect(store().exportProject().id).toBe(store().project.id)
  })

  it('sets and persists the structure template', async () => {
    expect(store().project.structureTemplateId).toBe('four-phase')
    store().setStructureTemplate('three-act')
    expect(store().project.structureTemplateId).toBe('three-act')
    await new Promise((r) => setTimeout(r, 700))
    expect(loadProject()?.structureTemplateId).toBe('three-act')
  })
})
