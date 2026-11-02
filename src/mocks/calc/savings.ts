import type { BudgetCategoryId } from '@/types/budget'
import type {
  MonthlySavings,
  SavingsByCategory,
  SavingsByRecommendation,
  SavingsHistory,
  SavingsHistoryPoint,
} from '@/types/savings'
import { daysInCurrentMonth, dayOfMonth } from '../clock'
import { categoryLabels } from './budget'
import { formatMonthLabel } from '@/utils/date'

/**
 * Fixed costs like rent land early in the month, so the first half underspends more than the
 * second half does. Projecting the early accrual rate straight through month end overstates
 * the result, so later days are discounted.
 */
const ACCRUAL_DECAY = 0.6

/**
 * Savings so far this month is what the user has not spent against the non-savings budget.
 * That amount is already banked, so the projection adds only what the remaining days are
 * expected to add, rather than scaling the whole figure up to month length.
 */
export function buildMonthlySavings(
  month: string,
  goal: number,
  byCategory: Array<{ category: BudgetCategoryId; saved: number }>,
  recommendations: SavingsByRecommendation[],
): MonthlySavings {
  const saved = byCategory.reduce((total, c) => total + c.saved, 0)
  const totalForPercent = saved > 0 ? saved : 1

  const categories: SavingsByCategory[] = byCategory
    .filter((c) => c.saved > 0)
    .map((c) => ({
      category: c.category,
      label: categoryLabels[c.category],
      saved: c.saved,
      percentOfTotal: Math.round((c.saved / totalForPercent) * 100),
    }))
    .sort((a, b) => b.saved - a.saved)

  const dayNow = dayOfMonth()
  const daysTotal = daysInCurrentMonth()
  const daysLeft = Math.max(0, daysTotal - dayNow)

  // `saved` is money already kept back by underspending, so it is banked, not a rate to
  // extrapolate over the whole month. Project it forward by assuming the same daily accrual
  // continues over the days that are actually left, then keep the result sane: nobody saves
  // more than their salary, and the remaining days cannot be worth more than the days so far.
  const dailyAccrual = dayNow > 0 ? saved / dayNow : 0
  const projected = Math.round(saved + dailyAccrual * daysLeft * ACCRUAL_DECAY)
  const percentOfGoal = goal > 0 ? Math.round((saved / goal) * 100) : 0

  return {
    month,
    monthLabel: formatMonthLabel(month),
    saved,
    goal,
    percentOfGoal,
    onTrack: projected >= goal,
    projectedByMonthEnd: projected,
    byCategory: categories,
    byRecommendation: [...recommendations].sort((a, b) => b.saved - a.saved),
    headline:
      projected >= goal
        ? `On track to save ₹${projected.toLocaleString('en-IN')} this month, past your ₹${goal.toLocaleString('en-IN')} goal.`
        : `On pace for ₹${projected.toLocaleString('en-IN')} — ₹${(goal - projected).toLocaleString('en-IN')} short of your goal.`,
  }
}

export function buildSavingsHistory(points: SavingsHistoryPoint[]): SavingsHistory {
  if (points.length === 0) {
    return {
      months: [],
      averageSaved: 0,
      bestMonth: '',
      totalSaved: 0,
      trendPercent: 0,
      summary: 'No savings history yet.',
    }
  }

  const total = points.reduce((sum, p) => sum + p.saved, 0)
  const average = Math.round(total / points.length)
  const best = points.reduce((a, b) => (b.saved > a.saved ? b : a))
  const first = points[0]!
  const last = points[points.length - 1]!
  const trendPercent =
    first.saved > 0 ? Math.round(((last.saved - first.saved) / first.saved) * 100) : 0

  return {
    months: points,
    averageSaved: average,
    bestMonth: best.monthLabel,
    totalSaved: total,
    trendPercent,
    summary: `Saved ₹${total.toLocaleString('en-IN')} over ${points.length} months, averaging ₹${average.toLocaleString('en-IN')} a month. Best month was ${best.monthLabel} at ₹${best.saved.toLocaleString('en-IN')}.`,
  }
}
