import type { BudgetCategoryId } from '@/types/budget'

/**
 * Display labels for budget categories. Lives in utils, not in mocks, because components
 * must never import from src/mocks/ — the mock backend imports this, not the other way round.
 */
export const categoryLabels: Record<BudgetCategoryId, string> = {
  rent: 'Rent',
  food: 'Food',
  groceries: 'Groceries',
  shopping: 'Shopping',
  travel: 'Travel',
  bills: 'Bills',
  misc: 'Misc',
  savings: 'Savings',
}

export const categoryIds = Object.keys(categoryLabels) as BudgetCategoryId[]
