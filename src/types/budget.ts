export type BudgetCategoryId =
  | 'rent'
  | 'food'
  | 'groceries'
  | 'shopping'
  | 'travel'
  | 'bills'
  | 'misc'
  | 'savings'

export type BudgetStatus = 'ok' | 'warning' | 'danger'

/** All money values are integer rupees, computed by the backend. */
export interface BudgetCategory {
  id: BudgetCategoryId
  label: string
  limit: number
  spent: number
  remaining: number
  percentUsed: number
  status: BudgetStatus
}

export interface Budget {
  month: string
  salary: number
  totalLimit: number
  totalSpent: number
  totalRemaining: number
  percentUsed: number
  daysLeftInMonth: number
  dailySafeSpend: number
  categories: BudgetCategory[]
}

export type BudgetCategorySummary = Pick<
  BudgetCategory,
  'id' | 'label' | 'limit' | 'spent' | 'remaining' | 'percentUsed' | 'status'
>

export interface UpdateBudgetRequest {
  categories: Array<{ id: BudgetCategoryId; limit: number }>
}
