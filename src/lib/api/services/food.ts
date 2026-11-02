import { apiGet, apiGetPaginated } from '../client'
import type {
  DeliveryComparison,
  FoodFilters,
  FoodListing,
  FoodListingSummary,
} from '@/types/food'
import type { Paginated } from '@/types/api'

export const foodService = {
  nearby: async (filters: FoodFilters): Promise<Paginated<FoodListingSummary>> => {
    const { data, meta } = await apiGetPaginated<FoodListingSummary[]>('/food/nearby', {
      area: filters.area,
      near: filters.near ?? 'home',
      maxPrice: filters.maxPrice,
      type: filters.type === 'all' ? undefined : filters.type,
      veg: filters.veg ? 'true' : undefined,
      sort: filters.sort ?? 'price',
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 12,
    })
    return { items: data, meta }
  },
  detail: (id: string) => apiGet<FoodListing>(`/food/${id}`),
  compareDelivery: (id: string, dish?: string) =>
    apiGet<DeliveryComparison>(`/food/${id}/compare-delivery`, dish ? { dish } : undefined),
}
