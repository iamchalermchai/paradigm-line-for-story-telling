import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'
import { ImportSceneBankDialog } from './ImportSceneBankDialog'

const SAMPLE = `Ghost: แอลถูกรุ่นพี่ตัดขาด

แอลเริ่มเขียนสมุดทุกคืน เขาตั้งใจเขียนให้ครบ

ชายปริศนาหายไป แอลเริ่มกลัวและอยากเงียบใส่ก่อน`

function reset() {
  localStorage.clear()
  useProjectStore.getState().createProject('ทดสอบนำเข้า')
  useProjectStore.setState({ past: [], future: [] })
  useUiStore.setState({ dialog: 'import-scene-bank' })
}

const store = () => useProjectStore.getState()

describe('ImportSceneBankDialog', () => {
  beforeEach(reset)

  it('parses pasted text into reviewable scenes and imports the selected ones', async () => {
    render(<ImportSceneBankDialog />)

    fireEvent.change(screen.getByLabelText('ข้อความ Scene Bank'), {
      target: { value: SAMPLE },
    })
    fireEvent.click(screen.getByText('วิเคราะห์'))

    // Review step appears with the extracted scenes.
    await waitFor(() => expect(screen.getByText(/พบ 3 ฉาก/)).toBeInTheDocument())

    fireEvent.click(screen.getByText(/เพิ่ม 3 ฉากลงกระดาน/))

    expect(store().project.scenes).toHaveLength(3)
    // Import closes the dialog.
    expect(useUiStore.getState().dialog).toBeNull()
  })

  it('fills only empty backstory fields, never overwriting', async () => {
    // Pre-fill ghost so it must NOT be overwritten.
    store().updateBackstory({ ghost: 'ผีเดิมที่ห้ามทับ' })

    render(<ImportSceneBankDialog />)
    fireEvent.change(screen.getByLabelText('ข้อความ Scene Bank'), {
      target: { value: SAMPLE },
    })
    fireEvent.click(screen.getByText('วิเคราะห์'))
    await waitFor(() => expect(screen.getByText(/พบ 3 ฉาก/)).toBeInTheDocument())
    fireEvent.click(screen.getByText(/เพิ่ม 3 ฉากลงกระดาน/))

    expect(store().project.backstory.ghost).toBe('ผีเดิมที่ห้ามทับ')
  })

  it('lets the user deselect a scene before importing', async () => {
    render(<ImportSceneBankDialog />)
    fireEvent.change(screen.getByLabelText('ข้อความ Scene Bank'), {
      target: { value: SAMPLE },
    })
    fireEvent.click(screen.getByText('วิเคราะห์'))
    await waitFor(() => expect(screen.getByText(/พบ 3 ฉาก/)).toBeInTheDocument())

    // Deselect the first suggestion.
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    fireEvent.click(screen.getByText(/เพิ่ม 2 ฉากลงกระดาน/))
    expect(store().project.scenes).toHaveLength(2)
  })
})
