import type { ExpenseFilters } from '@/types/expense'
import type { FoodFilters } from '@/types/food'
import type { HomeFilters } from '@/types/home'
import type { OfferFilters } from '@/types/offer'
import type { ProductFilters } from '@/types/product'

/** One key factory per domain. Mutations invalidate by the broadest matching prefix. */

export const metaKeys = {
  all: ['meta'] as const,
  areas: () => [...metaKeys.all, 'areas'] as const,
}

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
}

export const budgetKeys = {
  all: ['budget'] as const,
  current: () => [...budgetKeys.all, 'current'] as const,
}

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: ExpenseFilters) => [...expenseKeys.lists(), filters] as const,
}

export const foodKeys = {
  all: ['food'] as const,
  lists: () => [...foodKeys.all, 'list'] as const,
  nearby: (filters: FoodFilters) => [...foodKeys.lists(), filters] as const,
  details: () => [...foodKeys.all, 'detail'] as const,
  detail: (id: string) => [...foodKeys.details(), id] as const,
  compareDelivery: (id: string, dish?: string) =>
    [...foodKeys.detail(id), 'compare-delivery', dish ?? null] as const,
}

export const groceryKeys = {
  all: ['groceries'] as const,
  list: () => [...groceryKeys.all, 'list'] as const,
  compare: () => [...groceryKeys.all, 'compare'] as const,
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  search: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  priceHistory: (id: string, days: number) =>
    [...productKeys.detail(id), 'price-history', days] as const,
  alerts: () => [...productKeys.all, 'alerts'] as const,
}

export const offerKeys = {
  all: ['offers'] as const,
  lists: () => [...offerKeys.all, 'list'] as const,
  list: (filters: OfferFilters) => [...offerKeys.lists(), filters] as const,
}

export const homeKeys = {
  all: ['homes'] as const,
  lists: () => [...homeKeys.all, 'list'] as const,
  search: (filters: HomeFilters) => [...homeKeys.lists(), filters] as const,
  details: () => [...homeKeys.all, 'detail'] as const,
  detail: (id: string) => [...homeKeys.details(), id] as const,
}

export const savingsKeys = {
  all: ['savings'] as const,
  monthly: (month?: string) => [...savingsKeys.all, 'monthly', month ?? 'current'] as const,
  history: (months: number) => [...savingsKeys.all, 'history', months] as const,
}

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
}

export const chatKeys = {
  all: ['chat'] as const,
}
