import type { BudgetCategoryId } from '@/types/budget'
import type { Expense } from '@/types/expense'
import { dayInCurrentMonth, dayOfMonth } from '../clock'
import { createRandom, randomInt } from '../random'
import { categoryLabels } from '../calc/budget'
import { expenseTemplates, type ExpenseTemplate } from './expenseTemplates'
import { spentByCategory } from './budgetLimits'

/**
 * Builds the current month's expenses so each category lands exactly on its target spend.
 * Seeded, so the list is identical on every reload; dates are spread over days 1..15 of the
 * mock month. The last expense in a category absorbs the rounding remainder.
 */
export function generateCurrentMonthExpenses(): Expense[] {
  const rand = createRandom(20260115)
  const expenses: Expense[] = []
  const today = dayOfMonth()
  let seq = 1

  const push = (
    category: BudgetCategoryId,
    template: ExpenseTemplate,
    amount: number,
    day: number,
  ) => {
    const hour = randomInt(rand, 8, 21)
    const minute = randomInt(rand, 0, 59)
    expenses.push({
      id: `exp_${String(seq++).padStart(3, '0')}`,
      category,
      categoryLabel: categoryLabels[category],
      title: template.title,
      note: template.note ?? null,
      amount,
      merchant: template.merchant,
      source: template.source,
      spentAt: dayInCurrentMonth(day, hour, minute),
      createdAt: dayInCurrentMonth(day, hour, minute),
    })
  }

  for (const key of Object.keys(spentByCategory) as BudgetCategoryId[]) {
    const target = spentByCategory[key]
    const templates = expenseTemplates[key]
    if (target <= 0 || templates.length === 0) continue

    // Rent and other one-shot categories: a single entry on the 1st.
    if (templates.length === 1 && templates[0]!.amount === target) {
      push(key, templates[0]!, target, 1)
      continue
    }

    let remaining = target
    let guard = 0
    while (remaining > 0 && guard < 100) {
      guard++
      const template = templates[randomInt(rand, 0, templates.length - 1)]!
      // Stop adding full-price items once the rest would overshoot; absorb it instead.
      if (template.amount > remaining) {
        if (remaining >= 20) {
          push(key, template, remaining, randomInt(rand, 1, today))
        } else {
          // Too small to stand alone — fold it into the previous entry of this category.
          const last = [...expenses].reverse().find((e) => e.category === key)
          if (last) last.amount += remaining
          else push(key, template, remaining, randomInt(rand, 1, today))
        }
        remaining = 0
        break
      }
      push(key, template, template.amount, randomInt(rand, 1, today))
      remaining -= template.amount
    }
  }

  // Newest first, which is how the expenses list renders them.
  return expenses.sort((a, b) => b.spentAt.localeCompare(a.spentAt))
}
