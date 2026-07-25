import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import { useProjectStore } from '../store/projectStore'
import { BoardBookmarkRail } from './BoardBookmarkRail'

function reset() {
  localStorage.clear()
  useProjectStore.getState().importProject(createSeedProject())
  useProjectStore.setState({ past: [], future: [] })
}

describe('BoardBookmarkRail — มิติ', () => {
  beforeEach(reset)

  it('always shows the มิติ tab', () => {
    render(<BoardBookmarkRail />)
    expect(
      screen.getByRole('button', {
        name: 'มิติของเรื่องเล่า · META / CHARACTER / MEMORY / GHOST',
      }),
    ).toBeInTheDocument()
  })

  it('opens the มิติ leaf with diagram and suggest', () => {
    render(<BoardBookmarkRail initialOpenTab="layers" />)
    expect(screen.getByText('มิติของเรื่องเล่า')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'ขยายภาพมิติ' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'แนะนำมิติ' })).toBeInTheDocument()
  })

  it('structure leaf points to the มิติ tab instead of a toggle', () => {
    render(<BoardBookmarkRail initialOpenTab="structure" />)
    expect(screen.getByText(/ใช้แท็บ/)).toHaveTextContent('มิติ')
    expect(
      screen.queryByRole('checkbox', {
        name: /มิติของเรื่องเล่า/,
      }),
    ).not.toBeInTheDocument()
  })
})
