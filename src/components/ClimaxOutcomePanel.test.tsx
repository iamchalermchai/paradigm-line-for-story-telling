import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSeedProject } from '../domain/seed'
import { WANT_OUTCOME_LABELS } from '../domain/types'
import { useProjectStore } from '../store/projectStore'
import { ClimaxOutcomePanel } from './ClimaxOutcomePanel'

function reset() {
  localStorage.clear()
  useProjectStore.getState().importProject(createSeedProject())
  useProjectStore.setState({ past: [], future: [] })
}

describe('ClimaxOutcomePanel', () => {
  beforeEach(reset)

  it('reflects the seed outcome (Want not got)', () => {
    render(<ClimaxOutcomePanel />)
    expect(
      screen.getByDisplayValue(WANT_OUTCOME_LABELS.not_got),
    ).toBeInTheDocument()
  })

  it('updates the want outcome in the store', () => {
    render(<ClimaxOutcomePanel />)
    const wantSelect = screen.getByLabelText('Want (Climax)')
    fireEvent.change(wantSelect, { target: { value: 'got_better' } })
    expect(useProjectStore.getState().project.climaxOutcome.want).toBe(
      'got_better',
    )
  })

  it('shows board evidence for climax-tagged scenes', () => {
    render(<ClimaxOutcomePanel />)
    expect(screen.getByText('หลักฐานบนกระดาน')).toBeInTheDocument()
    expect(screen.getByText(/Want→/)).toBeInTheDocument()
  })
})
