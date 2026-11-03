import { apiGet, apiPut } from '../client'
import type {
  GroceryCatalogFilters,
  GroceryCatalogItem,
  GroceryComparison,
  GroceryList,
  UpdateGroceryListRequest,
} from '@/types/grocery'

export const groceryService = {
  getList: () => apiGet<GroceryList>('/groceries/list'),
  updateList: (payload: UpdateGroceryListRequest) =>
    apiPut<GroceryList>('/groceries/list', payload),
  compare: () => apiGet<GroceryComparison>('/groceries/compare'),
  catalog: (filters: GroceryCatalogFilters = {}) =>
    apiGet<GroceryCatalogItem[]>('/groceries/catalog', {
      q: filters.q || undefined,
      category: filters.category || undefined,
    }),
}
