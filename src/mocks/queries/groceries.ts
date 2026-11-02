import type {
  GroceryCatalogFilters,
  GroceryCatalogItem,
  GroceryComparison,
  GroceryList,
  GroceryPlanSummary,
} from '@/types/grocery'
import { db } from '../db'
import { groceryCatalog } from '../fixtures/groceries'
import {
  buildGroceryComparison,
  buildGroceryList,
  toGroceryPlanSummary,
} from '../calc/grocery'

/**
 * Database reads shared by the grocery handlers and the chat handler, so Buddy quotes exactly
 * the numbers the Groceries page shows.
 */

export function currentGroceryList(): GroceryList {
  return buildGroceryList(db.groceryList, groceryCatalog, db.budgetMonth, db.groceryListUpdatedAt)
}

export function currentGroceryComparison(): GroceryComparison {
  return buildGroceryComparison(db.groceryList, groceryCatalog, db.budgetMonth)
}

export function currentGroceryPlanSummary(): GroceryPlanSummary {
  return toGroceryPlanSummary(currentGroceryComparison())
}

export const groceryCategories: string[] = [...new Set(groceryCatalog.map((item) => item.category))]

/** Catalog search: case-insensitive name match, optionally narrowed to one category. */
export function searchGroceryCatalog(filters: GroceryCatalogFilters = {}): GroceryCatalogItem[] {
  const needle = filters.q?.trim().toLowerCase()
  return groceryCatalog.filter(
    (item) =>
      (!filters.category || item.category === filters.category) &&
      (!needle || item.name.toLowerCase().includes(needle)),
  )
}
