import { http } from 'msw'
import type { BudgetCategoryId } from '@/types/budget'
import type { CreateExpenseRequest, Expense } from '@/types/expense'
import { db, nextId, persistDb } from '../db'
import { buildCategory, categoryLabels } from '../calc/budget'
import { mockNow } from '../clock'
import {
  badRequest,
  notFound,
  ok,
  paginate,
  stringParam,
  validationError,
  withMockBehaviour,
} from '../http'

const validCategories = Object.keys(categoryLabels) as BudgetCategoryId[]

export const expenseHandlers = [
  http.get('*/expenses', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const url = new URL(request.url)
    const month = stringParam(url, 'month')
    const category = stringParam(url, 'category')
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 20)

    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return badRequest('The month parameter must look like 2026-10.')
    }
    if (category && !validCategories.includes(category as BudgetCategoryId)) {
      return badRequest(`Unknown category "${category}".`)
    }

    let items = [...db.expenses]
    if (month) items = items.filter((e) => e.spentAt.slice(0, 7) === month)
    if (category) items = items.filter((e) => e.category === category)

    // Newest first.
    items.sort((a, b) => b.spentAt.localeCompare(a.spentAt))

    // The sum covers everything matching the filter, not just the page, and is computed
    // here rather than in the component (money math belongs in the backend).
    const filteredTotal = items.reduce((sum, e) => sum + e.amount, 0)

    const { slice, meta } = paginate(items, page, pageSize)
    return ok({ expenses: slice, filteredTotal }, meta)
  }),

  http.post('*/expenses', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const body = (await request.json()) as CreateExpenseRequest

    if (!body.category || !validCategories.includes(body.category)) {
      return validationError('Choose a valid category.')
    }
    if (!body.title || !body.title.trim()) {
      return validationError('Give the expense a short title.')
    }
    if (!Number.isInteger(body.amount) || body.amount <= 0) {
      return validationError('Enter an amount in whole rupees greater than zero.')
    }
    if (body.amount > 1000000) {
      return validationError('That amount looks too large. Enter it in rupees.')
    }
    if (body.spentAt && Number.isNaN(Date.parse(body.spentAt))) {
      return validationError('The spent date is not a valid date.')
    }
    if (body.spentAt && Date.parse(body.spentAt) > mockNow().getTime()) {
      return validationError('You cannot log an expense in the future.')
    }

    const spentAt = body.spentAt ?? mockNow().toISOString()
    const expense: Expense = {
      id: nextId('exp'),
      category: body.category,
      categoryLabel: categoryLabels[body.category],
      title: body.title.trim(),
      note: body.note?.trim() || null,
      amount: body.amount,
      merchant: body.merchant?.trim() || null,
      source: 'manual',
      spentAt,
      createdAt: mockNow().toISOString(),
    }

    db.expenses.unshift(expense)
    db.expenses.sort((a, b) => b.spentAt.localeCompare(a.spentAt))
    persistDb()

    // The updated category lets the client reconcile the budget without a second round trip.
    const category = buildCategory(
      expense.category,
      db.budgetLimits[expense.category],
      db.expenses,
    )
    return ok({ expense, category })
  }),

  http.delete('*/expenses/:id', async ({ params }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const id = String(params.id)
    const index = db.expenses.findIndex((e) => e.id === id)
    if (index === -1) return notFound('Expense')

    const [removed] = db.expenses.splice(index, 1)
    persistDb()

    const category = buildCategory(removed!.category, db.budgetLimits[removed!.category], db.expenses)
    return ok({ id, category })
  }),
]
