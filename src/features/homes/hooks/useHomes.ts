import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { homeService } from '@/lib/api/services/homes'
import { homeKeys } from '@/lib/api/queryKeys'
import type { HomeFilters } from '@/types/home'

/** Keeps the previous page on screen while a new filter loads, so the grid never blanks. */
export function useHomeSearch(filters: HomeFilters) {
  return useQuery({
    queryKey: homeKeys.search(filters),
    queryFn: () => homeService.search(filters),
    staleTime: 2 * 60_000,
    placeholderData: keepPreviousData,
  })
}

export function useHome(id: string) {
  return useQuery({
    queryKey: homeKeys.detail(id),
    queryFn: () => homeService.detail(id),
    staleTime: 5 * 60_000,
    enabled: Boolean(id),
  })
}
