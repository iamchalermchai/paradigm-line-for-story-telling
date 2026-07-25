import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getStructureTemplate } from '../domain/structure'
import { createSeedProject } from '../domain/seed'
import { useProjectStore } from '../store/projectStore'
import { StructurePicker } from './StructurePicker'

describe('StructurePicker', () => {
  beforeEach(() => {
    localStorage.clear()
    useProjectStore.getState().importProject(createSeedProject())
    useProjectStore.setState({ past: [], future: [] })
  })

  it('shows short copy for the current structure', () => {
    render(<StructurePicker />)
    const fourPhase = getStructureTemplate('four-phase')
    expect(screen.getByText(fourPhase.description)).toBeInTheDocument()
    expect(screen.getByLabelText('เลือกโครงสร้างเรื่อง')).toHaveValue('four-phase')
  })

  it('expands to show what each column is for', () => {
    render(<StructurePicker />)
    fireEvent.click(screen.getByText(/อ่านเพิ่ม · แต่ละช่วงหมายถึงอะไร/))
    const fourPhase = getStructureTemplate('four-phase')
    expect(screen.getByText(fourPhase.bands[0].job)).toBeInTheDocument()
    expect(screen.getByText(fourPhase.bands[2].goal)).toBeInTheDocument()
  })

  it('refreshes column coaching when the structure changes', () => {
    render(<StructurePicker />)
    fireEvent.change(screen.getByLabelText('เลือกโครงสร้างเรื่อง'), {
      target: { value: 'heros-journey' },
    })
    fireEvent.click(screen.getByText(/อ่านเพิ่ม · แต่ละช่วงหมายถึงอะไร/))
    const hj = getStructureTemplate('heros-journey')
    expect(screen.getByText(hj.bands[0].job)).toBeInTheDocument()
    expect(screen.getByText(hj.bands[1].putHere)).toBeInTheDocument()
  })
})
