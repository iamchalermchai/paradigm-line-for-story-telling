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

  it('shows six bookmark tabs including ดูภาพ', () => {
    render(<BoardBookmarkRail />)
    expect(screen.getByRole('button', { name: 'เวลาในเรื่อง' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ลำดับเล่า' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'โครงสร้าง' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ชนิดเส้น' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'คู่มือแกนเส้น' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'แผนภาพสอน' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'เลน META / CHARACTER / MEMORY / GHOST' })).not.toBeInTheDocument()
  })

  it('shows the เลน tab when lane mode is on', () => {
    useProjectStore.getState().setLaneMode(true)
    render(<BoardBookmarkRail />)
    const laneTab = screen.getByRole('button', {
      name: 'เลน META / CHARACTER / MEMORY / GHOST',
    })
    expect(laneTab).toBeInTheDocument()
    fireEvent.click(laneTab)
    expect(screen.getByText('เลนบนกระดาน')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'ขยายภาพเลน' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'แนะนำเลน' })).toBeInTheDocument()
  })

  it('toggles lane mode from the structure leaf', () => {
    render(<BoardBookmarkRail />)
    fireEvent.click(screen.getByRole('button', { name: 'โครงสร้าง' }))
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'เปิดเลนการเล่า META CHARACTER MEMORY GHOST',
      }),
    )
    expect(useProjectStore.getState().project.laneMode).toBe(true)
    expect(
      screen.getByRole('button', { name: 'เลน META / CHARACTER / MEMORY / GHOST' }),
    ).toBeInTheDocument()
  })

  it('opens axis leaf so line meaning is not on the canvas', () => {
    render(<BoardBookmarkRail />)
    fireEvent.click(screen.getByRole('button', { name: 'คู่มือแกนเส้น' }))
    const fourPhase = getStructureTemplate('four-phase')
    expect(screen.getByText(fourPhase.axis.lineTitle)).toBeInTheDocument()
    expect(screen.getByText(fourPhase.axis.aboveHint)).toBeInTheDocument()
    expect(screen.getByText(fourPhase.axis.belowHint)).toBeInTheDocument()
  })

  it('shows the Paradigm diagram in ดูภาพ for 4 Phase', () => {
    render(<BoardBookmarkRail />)
    fireEvent.click(screen.getByRole('button', { name: 'แผนภาพสอน' }))
    expect(screen.getByText('แผนภาพสอน · Paradigm')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /แผนภาพสอน Paradigm Line/ }),
    ).toBeInTheDocument()
  })

  it('shows a Kishōtenketsu-specific diagram when that structure is active', () => {
    useProjectStore.getState().setStructureTemplate('kishotenketsu')
    render(<BoardBookmarkRail />)
    fireEvent.click(screen.getByRole('button', { name: 'แผนภาพสอน' }))
    expect(screen.getByText('แผนภาพสอน · Kishōtenketsu')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /แผนภาพสอน Kishōtenketsu/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/ไม่มีเครื่องยนต์ Want\/Need/)).toBeInTheDocument()
  })

  it('shows a Three Act diagram when that structure is active', () => {
    useProjectStore.getState().setStructureTemplate('three-act')
    render(<BoardBookmarkRail />)
    fireEvent.click(screen.getByRole('button', { name: 'แผนภาพสอน' }))
    expect(screen.getByText('แผนภาพสอน · Three Act')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /แผนภาพสอน Three Act/ }),
    ).toBeInTheDocument()
  })

  it('switches to telling mode when the telling bookmark is pressed', () => {
    render(<BoardBookmarkRail />)
    fireEvent.click(screen.getByRole('button', { name: 'ลำดับเล่า' }))
    expect(useUiStore.getState().viewMode).toBe('telling')
    expect(
      screen.getByText(/เส้นเล่า \(A→B→C…\) คือเส้นทางที่คนอ่านได้รับเรื่อง/),
    ).toBeInTheDocument()
  })

  it('folds the leaf closed', () => {
    render(<BoardBookmarkRail />)
    fireEvent.click(screen.getByRole('button', { name: 'โครงสร้าง' }))
    fireEvent.click(screen.getByRole('button', { name: 'พับแท็บ' }))
    expect(screen.queryByRole('button', { name: 'พับแท็บ' })).not.toBeInTheDocument()
  })
})
