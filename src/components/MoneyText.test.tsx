import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MoneyText } from './MoneyText'

describe('MoneyText', () => {
  it('formats with the Indian digit grouping', () => {
    render(<MoneyText amount={123450} />)
    expect(screen.getByText('₹1,23,450')).toBeInTheDocument()
  })

  it('rounds to whole rupees, never showing paise', () => {
    render(<MoneyText amount={1499.6} />)
    expect(screen.getByText('₹1,500')).toBeInTheDocument()
  })

  it('uses tabular figures so columns line up', () => {
    render(<MoneyText amount={100} />)
    expect(screen.getByText('₹100')).toHaveClass('tabular')
  })

  it('renders a minus sign for negative amounts', () => {
    render(<MoneyText amount={-1500} />)
    expect(screen.getByText('−₹1,500')).toBeInTheDocument()
  })

  it('shows an explicit plus when signed', () => {
    render(<MoneyText amount={1500} signed />)
    expect(screen.getByText('+₹1,500')).toBeInTheDocument()
  })

  it('omits the sign for zero even when signed', () => {
    render(<MoneyText amount={0} signed />)
    expect(screen.getByText('₹0')).toBeInTheDocument()
  })

  it('supports a compact form for tight spaces', () => {
    render(<MoneyText amount={140000} compact />)
    expect(screen.getByText('₹1.4L')).toBeInTheDocument()
  })

  it('applies the tone colour', () => {
    render(<MoneyText amount={100} tone="danger" />)
    expect(screen.getByText('₹100')).toHaveClass('text-destructive')
  })
})
