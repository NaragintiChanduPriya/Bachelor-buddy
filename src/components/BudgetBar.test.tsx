import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BudgetBar } from './BudgetBar'
import type { BudgetCategory } from '@/types/budget'

function category(overrides: Partial<BudgetCategory> = {}): BudgetCategory {
  return {
    id: 'food',
    label: 'Food',
    limit: 7500,
    spent: 5250,
    remaining: 2250,
    percentUsed: 70,
    status: 'warning',
    ...overrides,
  }
}

describe('BudgetBar', () => {
  it('shows the label, spent and limit', () => {
    render(<BudgetBar category={category()} />)
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('₹5,250')).toBeInTheDocument()
    expect(screen.getByText('₹7,500')).toBeInTheDocument()
  })

  it('exposes progress to assistive technology', () => {
    render(<BudgetBar category={category()} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '70')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(bar).toHaveAccessibleName('Food: 70% of budget used')
  })

  it('reports what is left when inside budget', () => {
    render(<BudgetBar category={category()} />)
    expect(screen.getByText(/left/)).toBeInTheDocument()
    expect(screen.getByText('₹2,250')).toBeInTheDocument()
  })

  it('reports the overspend when the limit is exceeded', () => {
    render(
      <BudgetBar
        category={category({ spent: 8000, remaining: -500, percentUsed: 107, status: 'danger' })}
      />,
    )
    expect(screen.getByText(/over budget/)).toBeInTheDocument()
    expect(screen.getByText('₹500')).toBeInTheDocument()
  })

  it('renders each status with its own colour', () => {
    const { container, rerender } = render(<BudgetBar category={category({ status: 'ok' })} />)
    expect(container.querySelector('.bg-success')).toBeTruthy()

    rerender(<BudgetBar category={category({ status: 'warning' })} />)
    expect(container.querySelector('.bg-warning')).toBeTruthy()

    rerender(<BudgetBar category={category({ status: 'danger' })} />)
    expect(container.querySelector('.bg-destructive')).toBeTruthy()
  })
})
