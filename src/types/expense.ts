import type { BudgetCategory, BudgetCategoryId } from './budget'

export type ExpenseSource = 'manual' | 'delivery' | 'subscription' | 'recurring'

export interface Expense {
  id: string
  category: BudgetCategoryId
  categoryLabel: string
  title: string
  note: string | null
  amount: number
  merchant: string | null
  source: ExpenseSource
  spentAt: string
  createdAt: string
}

export interface CreateExpenseRequest {
  category: BudgetCategoryId
  title: string
  amount: number
  merchant?: string | null
  note?: string | null
  spentAt?: string
}

export interface CreateExpenseResponse {
  expense: Expense
  category: BudgetCategory
}

/** GET /expenses payload: the page of expenses plus the total across the whole filter. */
export interface ExpenseListResponse {
  expenses: Expense[]
  filteredTotal: number
}

export interface ExpenseFilters {
  month?: string
  category?: BudgetCategoryId | 'all'
  page?: number
  pageSize?: number
}
