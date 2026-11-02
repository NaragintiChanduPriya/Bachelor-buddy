import type { BudgetCategoryId } from '@/types/budget'

/** The demo user's monthly plan: ₹40,000 salary split across eight categories. */
export const defaultLimits: Record<BudgetCategoryId, number> = {
  rent: 14000,
  food: 7500,
  groceries: 2500,
  shopping: 2500,
  travel: 2000,
  bills: 1500,
  misc: 2000,
  savings: 8000,
}

/**
 * How much of each category is spent by the mock "today" (the 15th).
 * CLAUDE.md fixes two of these: food is about 70% used, and shopping has ₹1,800 left.
 */
export const spentByCategory: Record<BudgetCategoryId, number> = {
  rent: 14000, // paid in full on the 1st
  food: 5250, // 70% of 7,500
  groceries: 1680,
  shopping: 700, // leaves ₹1,800 of the ₹2,500 limit
  travel: 1130,
  bills: 1340,
  misc: 920,
  savings: 0, // set aside at month end
}
