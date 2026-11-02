import { http } from 'msw'
import type { BudgetCategoryId, UpdateBudgetRequest } from '@/types/budget'
import { db, persistDb } from '../db'
import { buildBudget, validateLimits } from '../calc/budget'
import { ok, validationError, withMockBehaviour } from '../http'

export const budgetHandlers = [
  http.get('*/budget/current', async () => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    return ok(
      buildBudget(db.budgetMonth, db.user.preferences.salary, db.budgetLimits, db.expenses),
    )
  }),

  http.put('*/budget/current', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const body = (await request.json()) as UpdateBudgetRequest
    if (!Array.isArray(body.categories) || body.categories.length === 0) {
      return validationError('Send at least one category limit.')
    }

    // Merge the requested changes over the current limits, then validate the whole set.
    const merged = { ...db.budgetLimits }
    for (const entry of body.categories) {
      if (!(entry.id in merged)) {
        return validationError(`Unknown budget category "${entry.id}".`)
      }
      merged[entry.id] = entry.limit
    }

    const asList = (Object.keys(merged) as BudgetCategoryId[]).map((id) => ({
      id,
      limit: merged[id],
    }))
    const result = validateLimits(asList, db.user.preferences.salary)
    if (!result.valid) {
      return validationError(result.message ?? 'Those budget limits are not valid.', {
        total: result.total,
        salary: db.user.preferences.salary,
      })
    }

    db.budgetLimits = merged
    persistDb()
    return ok(
      buildBudget(db.budgetMonth, db.user.preferences.salary, db.budgetLimits, db.expenses),
    )
  }),
]
