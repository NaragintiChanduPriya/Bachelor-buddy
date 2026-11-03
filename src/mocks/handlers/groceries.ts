import { http } from 'msw'
import type { UpdateGroceryListRequest } from '@/types/grocery'
import { db, persistDb } from '../db'
import { nowISO } from '../clock'
import { groceryCatalog } from '../fixtures/groceries'
import { validateGroceryEntries } from '../calc/grocery'
import {
  currentGroceryComparison,
  currentGroceryList,
  groceryCategories,
  searchGroceryCatalog,
} from '../queries/groceries'
import { badRequest, ok, stringParam, validationError, withMockBehaviour } from '../http'

export const groceryHandlers = [
  http.get('*/groceries/catalog', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const url = new URL(request.url)
    const q = stringParam(url, 'q')
    const category = stringParam(url, 'category')
    if (category && !groceryCategories.includes(category)) {
      return badRequest(`Unknown grocery category "${category}".`, { categories: groceryCategories })
    }

    return ok(searchGroceryCatalog({ q, category }))
  }),

  http.get('*/groceries/list', async () => {
    const failure = await withMockBehaviour()
    if (failure) return failure
    return ok(currentGroceryList())
  }),

  http.put('*/groceries/list', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const body = (await request.json().catch(() => null)) as UpdateGroceryListRequest | null
    if (!body || typeof body !== 'object') {
      return validationError('Send the list as { "items": [{ "itemId", "quantity" }] }.')
    }

    const error = validateGroceryEntries(body.items, groceryCatalog)
    if (error) return validationError(error)

    db.groceryList = body.items.map(({ itemId, quantity }) => ({ itemId, quantity }))
    db.groceryListUpdatedAt = nowISO()
    persistDb()
    return ok(currentGroceryList())
  }),

  http.get('*/groceries/compare', async () => {
    const failure = await withMockBehaviour()
    if (failure) return failure
    return ok(currentGroceryComparison())
  }),
]
