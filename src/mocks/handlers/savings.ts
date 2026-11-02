import { http } from 'msw'
import { db } from '../db'
import { buildMonthlySavings, buildSavingsHistory } from '../calc/savings'
import {
  currentMonthSavingsByCategory,
  followedRecommendations,
  savingsHistoryPoints,
} from '../fixtures/savings'
import { badRequest, ok, withMockBehaviour } from '../http'

export const savingsHandlers = [
  http.get('*/savings/monthly', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const url = new URL(request.url)
    const month = url.searchParams.get('month') ?? db.budgetMonth
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return badRequest('The month parameter must look like 2026-10.')
    }

    // A past month comes from history; the current month is computed from live data.
    const past = savingsHistoryPoints.find((p) => p.month === month)
    if (past && month !== db.budgetMonth) {
      return ok(
        buildMonthlySavings(
          month,
          past.goal,
          [{ category: 'misc', saved: past.saved }],
          [],
        ),
      )
    }

    return ok(
      buildMonthlySavings(
        db.budgetMonth,
        db.user.preferences.savingsGoal,
        currentMonthSavingsByCategory,
        followedRecommendations,
      ),
    )
  }),

  http.get('*/savings/history', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const url = new URL(request.url)
    const monthsRaw = Number(url.searchParams.get('months') ?? 6)
    if (!Number.isInteger(monthsRaw) || monthsRaw < 1 || monthsRaw > 24) {
      return badRequest('The months parameter must be a whole number between 1 and 24.')
    }

    const points = savingsHistoryPoints.slice(-monthsRaw)
    return ok(buildSavingsHistory(points))
  }),
]
