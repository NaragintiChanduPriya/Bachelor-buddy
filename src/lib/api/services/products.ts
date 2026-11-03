import { apiDelete, apiGet, apiGetPaginated, apiPost } from '../client'
import type {
  PriceAlert,
  PriceHistory,
  ProductDetail,
  ProductFilters,
  ProductSummary,
  SetPriceAlertRequest,
} from '@/types/product'
import type { Paginated } from '@/types/api'

export const productService = {
  search: async (filters: ProductFilters): Promise<Paginated<ProductSummary>> => {
    const { data, meta } = await apiGetPaginated<ProductSummary[]>('/products/search', {
      q: filters.q || undefined,
      category: filters.category === 'all' ? undefined : filters.category,
      maxPrice: filters.maxPrice,
      sort: filters.sort ?? 'price',
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 12,
    })
    return { items: data, meta }
  },
  detail: (id: string) => apiGet<ProductDetail>(`/products/${id}`),
  priceHistory: (id: string, days = 90) =>
    apiGet<PriceHistory>(`/products/${id}/price-history`, { days }),
  alerts: () => apiGet<PriceAlert[]>('/products/alerts'),
  setAlert: (id: string, payload: SetPriceAlertRequest) =>
    apiPost<PriceAlert>(`/products/${id}/price-alert`, payload),
  removeAlert: (id: string) => apiDelete<{ productId: string }>(`/products/${id}/price-alert`),
}
