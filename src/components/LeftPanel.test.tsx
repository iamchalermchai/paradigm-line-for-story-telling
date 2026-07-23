import { ReactFlowProvider } from '@xyflow/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'
import { LeftPanel } from './LeftPanel'

function reset() {
  localStorage.clear()
  useProjectStore.getState().importProject(createSeedProject())
  useProjectStore.setState({ past: [], future: [] })
  useUiStore.setState({ editingSceneId: null })
}

function renderPanel() {
  return render(
    <ReactFlowProvider>
      <LeftPanel />
    </ReactFlowProvider>,
  )
}

describe('LeftPanel', () => {
  beforeEach(reset)

  it('defaults to the Story Action tab showing the scene outline', () => {
    renderPanel()
    expect(screen.getByText('เริ่มเขียนสมุด 30 วัน')).toBeInTheDocument()
  })

  it('switches to the Backstory tab and edits a field into the store', () => {
    renderPanel()
    fireEvent.click(screen.getByRole('tab', { name: /Backstory/ }))
    const ghost = screen.getByLabelText('Ghost')
    fireEvent.change(ghost, { target: { value: 'บาดแผลใหม่' } })
    expect(useProjectStore.getState().project.backstory.ghost).toBe('บาดแผลใหม่')
  })

  it('shows all five backstory fields on the Backstory tab', () => {
    renderPanel()
    fireEvent.click(screen.getByRole('tab', { name: /Backstory/ }))
    for (const label of ['Ghost', 'Lie', 'Lie at Work', 'Want', 'Need']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
  })

  it('clicking a scene row opens the editor for that scene (C-style selection)', () => {
    renderPanel()
    fireEvent.click(screen.getByText('เริ่มเขียนสมุด 30 วัน'))
    expect(useUiStore.getState().editingSceneId).toBe('scene-want')
  })
})
