import { ReactFlowProvider } from '@xyflow/react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import { loadProject } from '../store/persistence'
import { useProjectStore } from '../store/projectStore'
import { Board } from './Board'
import { phaseForX } from './graph'

function resetStore() {
  localStorage.clear()
  useProjectStore.getState().importProject(createSeedProject())
  useProjectStore.setState({ past: [], future: [] })
}

const store = () => useProjectStore.getState()

describe('Board (integration)', () => {
  beforeEach(resetStore)

  it('renders the React Flow canvas with the seed scenes', () => {
    render(
      <ReactFlowProvider>
        <Board />
      </ReactFlowProvider>,
    )
    // The React Flow root mounts.
    expect(document.querySelector('.react-flow')).toBeTruthy()
    // Seed scene titles render inside custom nodes.
    expect(screen.getByText('เริ่มเขียนสมุด 30 วัน')).toBeInTheDocument()
  })

  it('moving a scene into another phase updates its phase (drag reconcile)', () => {
    const before = store().project.scenes.find((s) => s.id === 'scene-want')!
    expect(before.phase).toBe('early')

    // Simulate a drag-stop that lands the card in the setup column.
    const droppedX = 120
    store().applyNodeDrag(
      [
        {
          id: 'scene-want',
          position: { x: droppedX, y: 200 },
          phase: phaseForX(droppedX),
        },
      ],
      [],
    )

    const after = store().project.scenes.find((s) => s.id === 'scene-want')!
    expect(after.phase).toBe('setup')
    expect(after.position).toEqual({ x: droppedX, y: 200 })
  })

  it('persists node positions across a reload', async () => {
    store().applyNodeDrag(
      [{ id: 'scene-climax', position: { x: 2500, y: 300 }, phase: 'ending' }],
      [],
    )
    // Wait for the debounced autosave.
    await new Promise((r) => setTimeout(r, 700))

    const reloaded = loadProject()
    const climax = reloaded?.scenes.find((s) => s.id === 'scene-climax')
    expect(climax?.position).toEqual({ x: 2500, y: 300 })
  })

  it('a drag is a single undoable step', () => {
    const original = {
      ...store().project.scenes.find((s) => s.id === 'scene-want')!.position,
    }
    store().applyNodeDrag(
      [{ id: 'scene-want', position: { x: 50, y: 50 }, phase: 'setup' }],
      [],
    )
    store().undo()
    const reverted = store().project.scenes.find((s) => s.id === 'scene-want')
    expect(reverted?.position).toEqual(original)
  })
})
