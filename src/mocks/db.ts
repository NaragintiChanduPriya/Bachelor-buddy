import type { BudgetCategoryId } from '@/types/budget'
import type { Expense } from '@/types/expense'
import type { Area, TechPark } from '@/types/meta'
import type { FoodListing } from '@/types/food'
import type { AgentNotification } from '@/types/notification'
import type { User } from '@/types/user'
import { areas, techParks } from './fixtures/areas'
import { defaultLimits } from './fixtures/budgetLimits'
import { generateCurrentMonthExpenses } from './fixtures/generateExpenses'
import { generateFoodListings } from './fixtures/generateFood'
import { notifications } from './fixtures/notifications'
import { demoUser } from './fixtures/user'
import { defaultGroceryList } from './fixtures/groceries'
import { defaultPriceAlerts } from './fixtures/products'
import { currentMonthKey, nowISO } from './clock'

/** One line of the user's monthly grocery list; prices are looked up from the catalog. */
export interface GroceryListEntry {
  itemId: string
  quantity: number
}

/** A stored price alert; current price and triggered state are derived on every read. */
export interface PriceAlertRecord {
  id: string
  productId: string
  targetPrice: number
  createdAt: string
}

/**
 * In-memory mock database, built from fixtures at startup. Mutating handlers write here so the
 * session feels live. Derived money values (spent, remaining, percentUsed) are never stored —
 * they are recomputed from expenses on every read, which is what makes logging an expense move
 * the budget bars immediately.
 */
export interface MockDb {
  areas: Area[]
  techParks: TechPark[]
  user: User
  budgetLimits: Record<BudgetCategoryId, number>
  budgetMonth: string
  expenses: Expense[]
  foodListings: FoodListing[]
  notifications: AgentNotification[]
  groceryList: GroceryListEntry[]
  groceryListUpdatedAt: string
  priceAlerts: PriceAlertRecord[]
  /** Incremented to mint new ids for records created during the session. */
  sequence: number
}

function build(): MockDb {
  return {
    areas: structuredClone(areas),
    techParks: structuredClone(techParks),
    user: structuredClone(demoUser),
    budgetLimits: { ...defaultLimits },
    budgetMonth: currentMonthKey(),
    expenses: generateCurrentMonthExpenses(),
    foodListings: generateFoodListings(),
    notifications: structuredClone(notifications),
    groceryList: structuredClone(defaultGroceryList),
    groceryListUpdatedAt: nowISO(),
    priceAlerts: structuredClone(defaultPriceAlerts),
    sequence: 1000,
  }
}

export let db: MockDb = build()

export function nextId(prefix: string): string {
  db.sequence += 1
  return `${prefix}_${db.sequence}`
}

/** Settings "Reset demo data" calls this. */
export function resetDb(): void {
  db = build()
  clearPersisted()
}

const STORAGE_KEY = 'bb-mock-db'

/** Persist to sessionStorage so a refresh keeps changes made during the demo. */
export function persistDb(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Storage full or unavailable (private mode) — the demo still works in memory.
  }
}

export function restoreDb(): void {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Partial<MockDb>
    // Only trust a snapshot from the same mock month, so the clock stays consistent.
    if (parsed && parsed.budgetMonth === currentMonthKey() && Array.isArray(parsed.expenses)) {
      db = { ...build(), ...parsed } as MockDb
    }
  } catch {
    // Corrupt snapshot — fall back to a fresh database.
  }
}

export function clearPersisted(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore.
  }
}
