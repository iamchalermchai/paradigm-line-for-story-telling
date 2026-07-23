import { ReactFlowProvider } from '@xyflow/react'
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import { useProjectStore } from '../store/projectStore'
import { SceneListPanel } from './SceneListPanel'

function reset() {
  localStorage.clear()
  useProjectStore.getState().importProject(createSeedProject())
  useProjectStore.setState({ past: [], future: [] })
}

function renderPanel() {
  return render(
    <ReactFlowProvider>
      <SceneListPanel />
    </ReactFlowProvider>,
  )
}

const store = () => useProjectStore.getState()

describe('SceneListPanel (structure-aware grouping)', () => {
  beforeEach(reset)

  it('groups by the 4-phase bands by default', () => {
    renderPanel()
    expect(screen.getByText('1. เริ่มต้น')).toBeInTheDocument()
    expect(screen.getByText('4. ช่วงท้าย')).toBeInTheDocument()
    // Catalyst scene (x=360) sits in the first band.
    expect(screen.getByText('คำแนะนำจาก Club Friday')).toBeInTheDocument()
  })

  it('regroups under Three Act headings when the structure changes', () => {
    store().setStructureTemplate('three-act')
    renderPanel()
    expect(screen.getByText('Act 2 · Confrontation')).toBeInTheDocument()
    expect(screen.queryByText('1. เริ่มต้น')).not.toBeInTheDocument()
    // scene-want (x=740) falls into Act 2 under three-act boundaries.
    expect(screen.getByText('เริ่มเขียนสมุด 30 วัน')).toBeInTheDocument()
  })

  it('moving a scene to another band re-buckets it (derived from x)', () => {
    store().setStructureTemplate('three-act')
    // Move scene-want far right into the Act 3 region (x > 75% of 2800 = 2100).
    store().applyNodeDrag(
      [{ id: 'scene-want', position: { x: 2600, y: -300 }, phase: 'ending' }],
      [],
    )
    renderPanel()
    const act3 = screen.getByText('Act 3 · Resolution').closest('div')!
    expect(within(act3).getByText('เริ่มเขียนสมุด 30 วัน')).toBeInTheDocument()
  })

  it('renders every scene exactly once regardless of template', () => {
    store().setStructureTemplate('save-the-cat')
    renderPanel()
    for (const scene of store().project.scenes) {
      expect(screen.getByText(scene.title)).toBeInTheDocument()
    }
  })
})
