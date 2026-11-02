import type {
  Budget,
  BudgetCategory,
  BudgetCategoryId,
  BudgetStatus,
} from '@/types/budget'
import type { Expense } from '@/types/expense'
import { daysInCurrentMonth, dayOfMonth } from '../clock'
import { categoryLabels } from '@/utils/categories'

/** Warning at 70% of a category limit, danger at 90%. */
export const WARNING_THRESHOLD = 70
export const DANGER_THRESHOLD = 90



export function statusFor(percentUsed: number): BudgetStatus {
  if (percentUsed >= DANGER_THRESHOLD) return 'danger'
  if (percentUsed >= WARNING_THRESHOLD) return 'warning'
  return 'ok'
}

/** Percent of a limit used, rounded to a whole number. A zero limit counts as fully used. */
export function percentUsed(spent: number, limit: number): number {
  if (limit <= 0) return spent > 0 ? 100 : 0
  return Math.round((spent / limit) * 100)
}

export function sumExpenses(expenses: Expense[], category: BudgetCategoryId): number {
  return expenses.reduce((total, e) => (e.category === category ? total + e.amount : total), 0)
}

/**
 * Builds one category row. Spent is always derived from expenses, never stored, so logging an
 * expense moves the bars on the next read.
 */
export function buildCategory(
  id: BudgetCategoryId,
  limit: number,
  expenses: Expense[],
): BudgetCategory {
  const spent = sumExpenses(expenses, id)
  const used = percentUsed(spent, limit)
  return {
    id,
    label: categoryLabels[id],
    limit,
    spent,
    remaining: limit - spent,
    percentUsed: used,
    status: statusFor(used),
  }
}

/**
 * The whole budget for a month. `savings` is a planned set-aside rather than a spend, so it
 * counts toward the limit total but its "spent" comes from expenses like every other row.
 */
export function buildBudget(
  month: string,
  salary: number,
  limits: Record<BudgetCategoryId, number>,
  expenses: Expense[],
): Budget {
  const categories = (Object.keys(limits) as BudgetCategoryId[]).map((id) =>
    buildCategory(id, limits[id], expenses),
  )

  const totalLimit = categories.reduce((t, c) => t + c.limit, 0)
  const totalSpent = categories.reduce((t, c) => t + c.spent, 0)
  const totalRemaining = totalLimit - totalSpent
  const daysLeft = daysInCurrentMonth() - dayOfMonth()

  // What is left to spend, excluding the savings set-aside, spread over the days remaining.
  const savingsRow = categories.find((c) => c.id === 'savings')
  const spendableRemaining = totalRemaining - Math.max(0, savingsRow?.remaining ?? 0)

  return {
    month,
    salary,
    totalLimit,
    totalSpent,
    totalRemaining,
    percentUsed: percentUsed(totalSpent, totalLimit),
    daysLeftInMonth: daysLeft,
    dailySafeSpend: daysLeft > 0 ? Math.max(0, Math.floor(spendableRemaining / daysLeft)) : 0,
    categories,
  }
}

/** Server-side validation for PUT /budget/current: the limits must fit inside the salary. */
export function validateLimits(
  limits: Array<{ id: BudgetCategoryId; limit: number }>,
  salary: number,
): { valid: boolean; total: number; message?: string } {
  const total = limits.reduce((t, c) => t + c.limit, 0)

  const negative = limits.find((c) => c.limit < 0)
  if (negative) {
    return { valid: false, total, message: `${categoryLabels[negative.id]} cannot be negative.` }
  }
  if (!limits.every((c) => Number.isInteger(c.limit))) {
    return { valid: false, total, message: 'Budget limits must be whole rupees.' }
  }
  if (total > salary) {
    return {
      valid: false,
      total,
      message: `Your category limits add up to ₹${total.toLocaleString('en-IN')}, which is more than your ₹${salary.toLocaleString('en-IN')} salary.`,
    }
  }
  return { valid: true, total }
}

export { categoryLabels }
