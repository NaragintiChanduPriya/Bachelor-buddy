import { apiGet, apiGetPaginated } from '../client'
import type {
  HomeDetail,
  HomeFilters,
  HomeSearchInsight,
  HomeSearchResponse,
  HomeSummary,
} from '@/types/home'
import type { Paginated } from '@/types/api'

export const homeService = {
  search: async (
    filters: HomeFilters,
  ): Promise<Paginated<HomeSummary> & { insight: HomeSearchInsight }> => {
    const { data, meta } = await apiGetPaginated<HomeSearchResponse>('/homes/search', {
      area: filters.area,
      maxRent: filters.maxRent,
      type: filters.type === 'all' ? undefined : filters.type,
      foodIncluded: filters.foodIncluded ? 'true' : undefined,
      maxDistanceKm: filters.maxDistanceKm,
      techPark: filters.techPark,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 12,
    })
    return { items: data.homes, meta, insight: data.insight }
  },
  detail: (id: string) => apiGet<HomeDetail>(`/homes/${id}`),
}
