import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import { projectToJson } from '../export/json'
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

    fireEvent.change(screen.getByLabelText('ข้อความหรือ JSON ที่จะนำเข้า'), {
      target: { value: SAMPLE },
    })
    fireEvent.click(screen.getByText('วิเคราะห์ / แมป'))

    await waitFor(() => expect(screen.getByText(/พบ 2 ฉาก/)).toBeInTheDocument())

    fireEvent.click(screen.getByText(/เพิ่ม 2 ฉากลงกระดาน/))

    expect(store().project.scenes).toHaveLength(2)
    expect(store().project.backstory.ghost).toContain('รุ่นพี่')
    expect(useUiStore.getState().dialog).toBeNull()
  })

  it('fills only empty backstory fields, never overwriting', async () => {
    store().updateBackstory({ ghost: 'ผีเดิมที่ห้ามทับ' })

    render(<ImportSceneBankDialog />)
    fireEvent.change(screen.getByLabelText('ข้อความหรือ JSON ที่จะนำเข้า'), {
      target: { value: SAMPLE },
    })
    fireEvent.click(screen.getByText('วิเคราะห์ / แมป'))
    await waitFor(() => expect(screen.getByText(/พบ 2 ฉาก/)).toBeInTheDocument())
    fireEvent.click(screen.getByText(/เพิ่ม 2 ฉากลงกระดาน/))

    expect(store().project.backstory.ghost).toBe('ผีเดิมที่ห้ามทับ')
  })

  it('lets the user deselect a scene before importing', async () => {
    render(<ImportSceneBankDialog />)
    fireEvent.change(screen.getByLabelText('ข้อความหรือ JSON ที่จะนำเข้า'), {
      target: { value: SAMPLE },
    })
    fireEvent.click(screen.getByText('วิเคราะห์ / แมป'))
    await waitFor(() => expect(screen.getByText(/พบ 2 ฉาก/)).toBeInTheDocument())

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    fireEvent.click(screen.getByText(/เพิ่ม 1 ฉากลงกระดาน/))
    expect(store().project.scenes).toHaveLength(1)
  })

  it('maps loose JSON scenes onto the board', async () => {
    render(<ImportSceneBankDialog />)
    fireEvent.change(screen.getByLabelText('ข้อความหรือ JSON ที่จะนำเข้า'), {
      target: {
        value: JSON.stringify([
          { title: 'เปิด', action: 'เริ่มต้น' },
          { title: 'จบ', summary: 'ปิดเรื่อง' },
        ]),
      },
    })
    fireEvent.click(screen.getByText('วิเคราะห์ / แมป'))
    await waitFor(() => expect(screen.getByText(/แมปจาก JSON/)).toBeInTheDocument())
    fireEvent.click(screen.getByText(/เพิ่ม 2 ฉากลงกระดาน/))
    expect(store().project.scenes).toHaveLength(2)
    expect(store().project.scenes.map((s) => s.title)).toEqual(
      expect.arrayContaining(['เปิด', 'จบ']),
    )
  })

  it('offers full project replace for Plotline JSON', async () => {
    const seed = createSeedProject()
    render(<ImportSceneBankDialog />)
    fireEvent.change(screen.getByLabelText('ข้อความหรือ JSON ที่จะนำเข้า'), {
      target: { value: projectToJson(seed) },
    })
    fireEvent.click(screen.getByText('วิเคราะห์ / แมป'))
    await waitFor(() =>
      expect(screen.getByText('แทนที่โปรเจกต์')).toBeInTheDocument(),
    )
    fireEvent.click(screen.getByText('แทนที่โปรเจกต์'))
    expect(store().project.title).toBe(seed.title)
    expect(store().project.scenes.length).toBe(seed.scenes.length)
  })
})
