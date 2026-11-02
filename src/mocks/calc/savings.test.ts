import { describe, expect, it } from 'vitest'
import { buildMonthlySavings, buildSavingsHistory } from './savings'
import { currentMonthKey } from '../clock'
import type { SavingsHistoryPoint } from '@/types/savings'

describe('buildMonthlySavings', () => {
  const result = buildMonthlySavings(
    currentMonthKey(),
    8000,
    [
      { category: 'food', saved: 2250 },
      { category: 'shopping', saved: 1800 },
      { category: 'travel', saved: 870 },
    ],
    [],
  )

  it('totals the category savings', () => {
    expect(result.saved).toBe(4920)
  })

  it('reports progress against the goal', () => {
    expect(result.percentOfGoal).toBe(Math.round((4920 / 8000) * 100))
  })

  it('projects forward from what is already banked, never below it', () => {
    // The amount saved so far is money already kept; a projection under it would be nonsense.
    expect(result.projectedByMonthEnd).toBeGreaterThanOrEqual(result.saved)
  })

  it('does not extrapolate the early-month rate across the whole month', () => {
    // The naive projection (saved / 15 * 31) roughly doubles the figure; ours must be lower.
    const naive = Math.round((result.saved / 15) * 31)
    expect(result.projectedByMonthEnd).toBeLessThan(naive)
  })

  it('sorts categories by amount saved, largest first', () => {
    expect(result.byCategory.map((c) => c.category)).toEqual(['food', 'shopping', 'travel'])
  })

  it('gives each category a share of the total', () => {
    const total = result.byCategory.reduce((sum, c) => sum + c.percentOfTotal, 0)
    expect(total).toBeGreaterThan(95)
    expect(total).toBeLessThanOrEqual(105)
  })

  it('writes a headline that matches whether it is on track', () => {
    expect(result.headline).toMatch(result.onTrack ? /On track/ : /short of your goal/)
  })

  it('handles a zero-saving month without dividing by zero', () => {
    const empty = buildMonthlySavings(currentMonthKey(), 8000, [], [])
    expect(empty.saved).toBe(0)
    expect(empty.percentOfGoal).toBe(0)
    expect(Number.isFinite(empty.projectedByMonthEnd)).toBe(true)
    expect(empty.byCategory).toEqual([])
  })
})

describe('buildSavingsHistory', () => {
  const points: SavingsHistoryPoint[] = [
    { month: '2026-05', monthLabel: 'May 2026', saved: 2100, goal: 8000 },
    { month: '2026-06', monthLabel: 'June 2026', saved: 4600, goal: 8000 },
    { month: '2026-07', monthLabel: 'July 2026', saved: 7600, goal: 8000 },
  ]

  it('totals and averages the months', () => {
    const history = buildSavingsHistory(points)
    expect(history.totalSaved).toBe(14300)
    expect(history.averageSaved).toBe(Math.round(14300 / 3))
  })

  it('finds the best month', () => {
    expect(buildSavingsHistory(points).bestMonth).toBe('July 2026')
  })

  it('reports the trend from first to last month', () => {
    // 2100 -> 7600 is a rise of about 262%.
    expect(buildSavingsHistory(points).trendPercent).toBe(262)
  })

  it('handles an empty history', () => {
    const history = buildSavingsHistory([])
    expect(history.totalSaved).toBe(0)
    expect(history.averageSaved).toBe(0)
    expect(history.months).toEqual([])
  })
})
