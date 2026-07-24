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

  it('pasteScenes creates new offset scenes in one undoable step', () => {
    const source = store().project.scenes.find((s) => s.id === 'scene-want')!
    const before = store().project.scenes.length
    const pastBefore = store().past.length

    const created = store().pasteScenes([source])
    expect(created).toHaveLength(1)
    expect(created[0].id).not.toBe(source.id)
    expect(created[0].title).toBe(source.title)
    expect(created[0].position).toEqual({
      x: source.position.x + 40,
      y: source.position.y + 40,
    })
    expect(store().project.scenes).toHaveLength(before + 1)
    // One history entry for the whole paste; a single undo removes it.
    expect(store().past.length).toBe(pastBefore + 1)
    store().undo()
    expect(store().project.scenes).toHaveLength(before)
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

  it('sets and persists the project title', async () => {
    store().setTitle('เรื่องของแอล ภาค 2')
    expect(store().project.title).toBe('เรื่องของแอล ภาค 2')
    await new Promise((r) => setTimeout(r, 700))
    expect(loadProject()?.title).toBe('เรื่องของแอล ภาค 2')
  })

  it('adds and deletes beats', () => {
    const beat = store().addBeat('midpoint')
    expect(store().project.beats.some((b) => b.id === beat.id)).toBe(true)
    store().deleteBeat(beat.id)
    expect(store().project.beats.some((b) => b.id === beat.id)).toBe(false)
  })

  it('deleteElements removes many scenes + their edges in a single undoable step', () => {
    const sceneCountBefore = store().project.scenes.length
    const edgeCountBefore = store().project.edges.length
    const pastBefore = store().past.length

    // scene-want and scene-progress each have connected edges in the seed.
    store().deleteElements({ sceneIds: ['scene-want', 'scene-progress'] })

    const p = store().project
    expect(p.scenes.some((s) => s.id === 'scene-want')).toBe(false)
    expect(p.scenes.some((s) => s.id === 'scene-progress')).toBe(false)
    expect(p.scenes).toHaveLength(sceneCountBefore - 2)
    // Edges touching the removed scenes are gone too.
    expect(
      p.edges.some(
        (e) =>
          ['scene-want', 'scene-progress'].includes(e.source) ||
          ['scene-want', 'scene-progress'].includes(e.target),
      ),
    ).toBe(false)
    expect(p.edges.length).toBeLessThan(edgeCountBefore)

    // Exactly one history entry pushed for the whole batch.
    expect(store().past.length).toBe(pastBefore + 1)

    // A single undo restores everything.
    store().undo()
    expect(store().project.scenes).toHaveLength(sceneCountBefore)
    expect(store().project.edges).toHaveLength(edgeCountBefore)
  })

  it('deleteElements also removes beats and explicit edge ids', () => {
    store().deleteElements({ beatIds: ['beat-midpoint'], edgeIds: ['e-arc'] })
    expect(store().project.beats.some((b) => b.id === 'beat-midpoint')).toBe(false)
    expect(store().project.edges.some((e) => e.id === 'e-arc')).toBe(false)
  })

  it('deleteElements is a no-op when nothing is passed', () => {
    const pastBefore = store().past.length
    store().deleteElements({})
    expect(store().past.length).toBe(pastBefore)
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

  it('addTellingChapter appends an empty chapter key and persists', async () => {
    const before = store().project.tellingChapterOrder.length
    const key = store().addTellingChapter()
    expect(store().project.tellingChapterOrder).toContain(key)
    expect(store().project.tellingChapterOrder).toHaveLength(before + 1)
    await new Promise((r) => setTimeout(r, 700))
    expect(loadProject()?.tellingChapterOrder).toContain(key)
  })

  it('reordering chapters relabels the derived letters (drag outcome)', async () => {
    const { chapterLetterForScene } = await import('../domain/telling')
    // Seed order is [A..E]; scene-midpoint is in chapter key 'A' = letter A.
    const midpoint = () =>
      store().project.scenes.find((s) => s.id === 'scene-midpoint')!
    expect(
      chapterLetterForScene(midpoint(), store().project.scenes, store().project.tellingChapterOrder),
    ).toBe('A')
    // Drag chapter 'A' to third position → its scenes now read as letter C.
    store().reorderTellingChapters(['B', 'C', 'A', 'D', 'E'])
    expect(
      chapterLetterForScene(midpoint(), store().project.scenes, store().project.tellingChapterOrder),
    ).toBe('C')
  })

  it('moving a scene to a chapter is an undoable content edit', () => {
    store().updateScene('scene-want', { tellingChapter: 'A' })
    expect(store().project.scenes.find((s) => s.id === 'scene-want')?.tellingChapter).toBe('A')
    store().undo()
    expect(store().project.scenes.find((s) => s.id === 'scene-want')?.tellingChapter).toBe('C')
  })

  it('sets and persists the structure template', async () => {
    expect(store().project.structureTemplateId).toBe('four-phase')
    store().setStructureTemplate('three-act')
    expect(store().project.structureTemplateId).toBe('three-act')
    await new Promise((r) => setTimeout(r, 700))
    expect(loadProject()?.structureTemplateId).toBe('three-act')
  })
})
