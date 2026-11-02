import { describe, expect, it } from 'vitest'
import { generateCurrentMonthExpenses } from './generateExpenses'
import { spentByCategory } from './budgetLimits'
import { currentMonthKey, dayOfMonth } from '../clock'
import type { BudgetCategoryId } from '@/types/budget'

describe('generateCurrentMonthExpenses', () => {
  const expenses = generateCurrentMonthExpenses()

  it('generates 40 or more expenses as the brief requires', () => {
    expect(expenses.length).toBeGreaterThanOrEqual(40)
  })

  it('is deterministic across calls', () => {
    const again = generateCurrentMonthExpenses()
    expect(again.map((e) => `${e.id}:${e.amount}`)).toEqual(
      expenses.map((e) => `${e.id}:${e.amount}`),
    )
  })

  it('adds up to exactly the target spend in every category', () => {
    for (const key of Object.keys(spentByCategory) as BudgetCategoryId[]) {
      const total = expenses
        .filter((e) => e.category === key)
        .reduce((sum, e) => sum + e.amount, 0)
      expect(total, `category ${key}`).toBe(spentByCategory[key])
    }
  })

  it('uses integer rupees only', () => {
    for (const e of expenses) {
      expect(Number.isInteger(e.amount), `${e.id} = ${e.amount}`).toBe(true)
      expect(e.amount).toBeGreaterThan(0)
    }
  })

  it('places every expense in the mock current month, on or before the 15th', () => {
    const month = currentMonthKey()
    for (const e of expenses) {
      expect(e.spentAt.slice(0, 7)).toBe(month)
      const day = Number(e.spentAt.slice(8, 10))
      expect(day).toBeLessThanOrEqual(dayOfMonth())
      expect(day).toBeGreaterThanOrEqual(1)
    }
  })

  it('is sorted newest first', () => {
    const dates = expenses.map((e) => e.spentAt)
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates)
  })

  it('gives every expense a unique id', () => {
    expect(new Set(expenses.map((e) => e.id)).size).toBe(expenses.length)
  })

  it('includes recognisable Bangalore detail', () => {
    const titles = expenses.map((e) => `${e.title} ${e.merchant ?? ''}`).join(' ')
    expect(titles).toMatch(/BMTC|Metro|bike taxi|filter coffee|Wi-Fi|Electricity|cook|maid/i)
  })
})
