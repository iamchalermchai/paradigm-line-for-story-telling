import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getStructureTemplate } from '../domain/structure'
import { createSeedProject } from '../domain/seed'
import { useProjectStore } from '../store/projectStore'
import { useUiStore } from '../store/uiStore'
import { BoardBookmarkRail } from './BoardBookmarkRail'

describe('BoardBookmarkRail', () => {
  beforeEach(() => {
    localStorage.clear()
    useProjectStore.getState().importProject(createSeedProject())
    useUiStore.setState({ viewMode: 'chronological' })
  })

  it('shows five bookmark tabs', () => {
    render(<BoardBookmarkRail />)
    expect(screen.getByRole('button', { name: 'เวลาในเรื่อง' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ลำดับเล่า' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'โครงสร้าง' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ชนิดเส้น' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'คู่มือแกนเส้น' })).toBeInTheDocument()
  })

  it('opens axis leaf so line meaning is not on the canvas', () => {
    render(<BoardBookmarkRail />)
    fireEvent.click(screen.getByRole('button', { name: 'คู่มือแกนเส้น' }))
    const fourPhase = getStructureTemplate('four-phase')
    expect(screen.getByText(fourPhase.axis.lineTitle)).toBeInTheDocument()
    expect(screen.getByText(fourPhase.axis.aboveHint)).toBeInTheDocument()
    expect(screen.getByText(fourPhase.axis.belowHint)).toBeInTheDocument()
  })

  it('switches to telling mode when the telling bookmark is pressed', () => {
    render(<BoardBookmarkRail />)
    fireEvent.click(screen.getByRole('button', { name: 'ลำดับเล่า' }))
    expect(useUiStore.getState().viewMode).toBe('telling')
    expect(screen.getByText('ลำดับเล่า')).toBeInTheDocument()
    expect(
      screen.getByText(/เส้นเล่า \(A→B→C…\) คือเส้นทางที่คนอ่านได้รับเรื่อง/),
    ).toBeInTheDocument()
  })

  it('folds the leaf closed', () => {
    render(<BoardBookmarkRail />)
    fireEvent.click(screen.getByRole('button', { name: 'โครงสร้าง' }))
    expect(screen.getByText('โครงสร้าง')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'พับแท็บ' }))
    expect(screen.queryByRole('button', { name: 'พับแท็บ' })).not.toBeInTheDocument()
  })
})
