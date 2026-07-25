import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { STRUCTURE_TEMPLATES } from '../domain/structure'
import { useUiStore } from '../store/uiStore'
import { HelpDialog } from './HelpDialog'

describe('HelpDialog', () => {
  beforeEach(() => {
    useUiStore.setState({ dialog: null })
  })

  it('renders nothing until the help dialog is opened', () => {
    const { container } = render(<HelpDialog />)
    expect(container).toBeEmptyDOMElement()
  })

  it('teaches every structure the app actually offers', () => {
    useUiStore.getState().openDialog('help')
    render(<HelpDialog />)
    for (const template of STRUCTURE_TEMPLATES) {
      expect(screen.getByText(template.name)).toBeInTheDocument()
      expect(screen.getByText(template.startHere)).toBeInTheDocument()
    }
  })

  it('shows the beats a structure will drop on the line', () => {
    useUiStore.getState().openDialog('help')
    render(<HelpDialog />)
    expect(screen.getByText('転 จุดพลิก')).toBeInTheDocument()
    expect(screen.getByText('All Is Lost')).toBeInTheDocument()
    expect(screen.getByText('Ordeal')).toBeInTheDocument()
  })
})
