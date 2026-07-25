import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { STRUCTURE_TEMPLATES } from '../domain/structure'
import { useProjectStore } from '../store/projectStore'
import { StructureChooser } from './StructureChooser'

const DISMISS_KEY = 'plotline-board:structure-chooser-dismissed'

function resetEmptyBoard() {
  sessionStorage.clear()
  localStorage.clear()
  useProjectStore.getState().createProject('กระดานว่าง')
  useProjectStore.setState({ past: [], future: [] })
}

describe('StructureChooser', () => {
  beforeEach(resetEmptyBoard)

  it('opens on an empty board and lists every structure', () => {
    render(<StructureChooser />)
    expect(
      screen.getByRole('dialog', { name: 'เลือกโครงเรื่อง' }),
    ).toBeInTheDocument()
    for (const template of STRUCTURE_TEMPLATES) {
      expect(screen.getByText(template.name)).toBeInTheDocument()
    }
  })

  it('does not open when the board already has scenes', () => {
    useProjectStore.getState().addScene({ title: 'ฉากมีแล้ว' })
    render(<StructureChooser />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not reopen after being dismissed in the session', () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    render(<StructureChooser />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('applies the chosen structure and closes', () => {
    render(<StructureChooser />)
    fireEvent.click(screen.getByText("Hero's Journey"))
    expect(useProjectStore.getState().project.structureTemplateId).toBe(
      'heros-journey',
    )
    expect(useProjectStore.getState().project.beats).toHaveLength(12)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(sessionStorage.getItem(DISMISS_KEY)).toBe('1')
  })

  it('skip scaffolds the default 4 Phase markers', () => {
    render(<StructureChooser />)
    fireEvent.click(screen.getByText(/ข้าม ใช้ 4 Phase/))
    expect(useProjectStore.getState().project.structureTemplateId).toBe(
      'four-phase',
    )
    expect(useProjectStore.getState().project.beats.length).toBeGreaterThan(0)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
