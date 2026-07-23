import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import { EDGE_LABELS } from '../domain/types'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'
import { EdgeEditor } from './EdgeEditor'

function reset() {
  localStorage.clear()
  useProjectStore.getState().importProject(createSeedProject())
  useProjectStore.setState({ past: [], future: [] })
  useUiStore.setState({ selectedEdgeId: null })
}

const store = () => useProjectStore.getState()

describe('EdgeEditor', () => {
  beforeEach(reset)

  it('renders nothing when no edge is selected', () => {
    const { container } = render(<EdgeEditor />)
    expect(container).toBeEmptyDOMElement()
  })

  it('changes the edge type', () => {
    useUiStore.getState().selectEdge('e-actual-1')
    render(<EdgeEditor />)
    const select = screen.getByDisplayValue(EDGE_LABELS.actual_path)
    fireEvent.change(select, { target: { value: 'failure_path' } })
    expect(store().project.edges.find((e) => e.id === 'e-actual-1')?.type).toBe(
      'failure_path',
    )
  })

  it('edits the edge label', () => {
    useUiStore.getState().selectEdge('e-actual-1')
    render(<EdgeEditor />)
    const input = screen.getByLabelText(/ป้ายกำกับ/)
    fireEvent.change(input, { target: { value: 'จุดพลิก' } })
    expect(store().project.edges.find((e) => e.id === 'e-actual-1')?.label).toBe(
      'จุดพลิก',
    )
  })

  it('deletes the edge and clears the selection', () => {
    useUiStore.getState().selectEdge('e-actual-1')
    render(<EdgeEditor />)
    fireEvent.click(screen.getByText('ลบเส้นเชื่อม'))
    expect(store().project.edges.some((e) => e.id === 'e-actual-1')).toBe(false)
    expect(useUiStore.getState().selectedEdgeId).toBeNull()
  })
})
