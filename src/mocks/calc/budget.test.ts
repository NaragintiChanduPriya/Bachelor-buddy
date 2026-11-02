import { describe, expect, it } from 'vitest'
import type { Expense } from '@/types/expense'
import type { BudgetCategoryId } from '@/types/budget'
import { buildBudget, buildCategory, percentUsed, statusFor, validateLimits } from './budget'
import { defaultLimits } from '../fixtures/budgetLimits'
import { generateCurrentMonthExpenses } from '../fixtures/generateExpenses'
import { currentMonthKey } from '../clock'

function expense(category: BudgetCategoryId, amount: number): Expense {
  return {
    id: `exp_${category}_${amount}`,
    category,
    categoryLabel: category,
    title: 'test',
    note: null,
    amount,
    merchant: null,
    source: 'manual',
    spentAt: '2026-10-10T07:00:00.000Z',
    createdAt: '2026-10-10T07:00:00.000Z',
  }
}

describe('percentUsed', () => {
  it('rounds to a whole percent', () => {
    expect(percentUsed(5250, 7500)).toBe(70)
    expect(percentUsed(1, 3)).toBe(33)
  })

  it('treats a zero limit as fully used only when something was spent', () => {
    expect(percentUsed(0, 0)).toBe(0)
    expect(percentUsed(100, 0)).toBe(100)
  })
})

describe('statusFor', () => {
  it('warns at 70 and flags danger at 90', () => {
    expect(statusFor(69)).toBe('ok')
    expect(statusFor(70)).toBe('warning')
    expect(statusFor(89)).toBe('warning')
    expect(statusFor(90)).toBe('danger')
    expect(statusFor(120)).toBe('danger')
  })
})

describe('buildCategory', () => {
  it('derives spent, remaining and status from the expenses', () => {
    const category = buildCategory('food', 7500, [expense('food', 5000), expense('food', 250)])
    expect(category.spent).toBe(5250)
    expect(category.remaining).toBe(2250)
    expect(category.percentUsed).toBe(70)
    expect(category.status).toBe('warning')
  })

  it('ignores expenses from other categories', () => {
    const category = buildCategory('food', 7500, [expense('travel', 5000)])
    expect(category.spent).toBe(0)
  })

  it('reports an overspend as negative remaining and danger', () => {
    const category = buildCategory('shopping', 2500, [expense('shopping', 3000)])
    expect(category.remaining).toBe(-500)
    expect(category.status).toBe('danger')
  })
})

describe('buildBudget', () => {
  const budget = buildBudget(
    currentMonthKey(),
    40000,
    defaultLimits,
    generateCurrentMonthExpenses(),
  )

  it('totals the limits to the salary', () => {
    expect(budget.totalLimit).toBe(40000)
    expect(budget.salary).toBe(40000)
  })

  it('hits the food target from CLAUDE.md: about 70% used by the 15th', () => {
    const food = budget.categories.find((c) => c.id === 'food')
    expect(food?.spent).toBe(5250)
    expect(food?.percentUsed).toBe(70)
    expect(food?.status).toBe('warning')
  })

  it('hits the shopping target from CLAUDE.md: ₹1,800 left', () => {
    const shopping = budget.categories.find((c) => c.id === 'shopping')
    expect(shopping?.remaining).toBe(1800)
  })

  it('keeps every category inside its limit', () => {
    for (const category of budget.categories) {
      expect(category.spent).toBeLessThanOrEqual(category.limit)
    }
  })

  it('never suggests spending the savings set-aside', () => {
    const savings = budget.categories.find((c) => c.id === 'savings')
    const spendable = budget.totalRemaining - (savings?.remaining ?? 0)
    expect(budget.dailySafeSpend * budget.daysLeftInMonth).toBeLessThanOrEqual(spendable)
  })

  it('returns a non-negative daily safe spend', () => {
    expect(budget.dailySafeSpend).toBeGreaterThanOrEqual(0)
  })
})

describe('validateLimits', () => {
  const limits = (total: number) => [
    { id: 'food' as const, limit: total },
    { id: 'rent' as const, limit: 0 },
  ]

  it('accepts limits that fit inside the salary', () => {
    expect(validateLimits(limits(40000), 40000).valid).toBe(true)
    expect(validateLimits(limits(30000), 40000).valid).toBe(true)
  })

  it('rejects limits that exceed the salary', () => {
    const result = validateLimits(limits(45000), 40000)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('more than')
  })

  it('rejects negative limits', () => {
    const result = validateLimits([{ id: 'food', limit: -100 }], 40000)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('negative')
  })

  it('rejects fractional rupees', () => {
    const result = validateLimits([{ id: 'food', limit: 100.5 }], 40000)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('whole rupees')
  })
})
