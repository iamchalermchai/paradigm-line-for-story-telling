import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'
import { SceneEditorDrawer } from './SceneEditorDrawer'

function reset() {
  localStorage.clear()
  useProjectStore.getState().importProject(createSeedProject())
  useProjectStore.setState({ past: [], future: [] })
  useUiStore.setState({ editingSceneId: null, dialog: null })
}

const store = () => useProjectStore.getState()

describe('SceneEditorDrawer', () => {
  beforeEach(reset)

  it('renders nothing when no scene is being edited', () => {
    const { container } = render(<SceneEditorDrawer />)
    expect(container).toBeEmptyDOMElement()
  })

  it('populates fields from the edited scene', () => {
    useUiStore.getState().openSceneEditor('scene-want')
    render(<SceneEditorDrawer />)
    expect(screen.getByDisplayValue('เริ่มเขียนสมุด 30 วัน')).toBeInTheDocument()
    expect(screen.getByText('Character + Action = Plot')).toBeInTheDocument()
  })

  it('shows a warning when the outcome is cleared', () => {
    useUiStore.getState().openSceneEditor('scene-want')
    render(<SceneEditorDrawer />)
    const outcome = screen.getByLabelText('ผลลัพธ์คืออะไร')
    fireEvent.change(outcome, { target: { value: '' } })
    expect(screen.getByText('ฉากนี้ยังไม่มีผลลัพธ์')).toBeInTheDocument()
  })

  it('warns when phase conflicts with the beat', () => {
    useUiStore.getState().openSceneEditor('scene-want') // beat = want (early)
    render(<SceneEditorDrawer />)
    const phase = screen.getByLabelText('ช่วงของเรื่อง')
    fireEvent.change(phase, { target: { value: 'ending' } })
    expect(
      screen.getByText('ช่วงของเรื่องขัดกับ Story Beat ที่เลือกไว้'),
    ).toBeInTheDocument()
  })

  it('saves edits back to the store and closes', () => {
    useUiStore.getState().openSceneEditor('scene-want')
    render(<SceneEditorDrawer />)
    const title = screen.getByLabelText('ชื่อฉาก')
    fireEvent.change(title, { target: { value: 'ชื่อใหม่' } })
    fireEvent.click(screen.getByText('บันทึก'))

    expect(store().project.scenes.find((s) => s.id === 'scene-want')?.title).toBe(
      'ชื่อใหม่',
    )
    expect(useUiStore.getState().editingSceneId).toBeNull()
  })

  it('does not mutate the store until save (draft is local)', () => {
    useUiStore.getState().openSceneEditor('scene-want')
    render(<SceneEditorDrawer />)
    fireEvent.change(screen.getByLabelText('ชื่อฉาก'), {
      target: { value: 'ยังไม่บันทึก' },
    })
    // No save click yet.
    expect(
      store().project.scenes.find((s) => s.id === 'scene-want')?.title,
    ).toBe('เริ่มเขียนสมุด 30 วัน')
  })
})
