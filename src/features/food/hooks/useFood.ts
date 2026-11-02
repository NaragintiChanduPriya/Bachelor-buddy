import { useQuery } from '@tanstack/react-query'
import { foodService } from '@/lib/api/services/food'
import { foodKeys } from '@/lib/api/queryKeys'
import type { FoodFilters } from '@/types/food'

export function useNearbyFood(filters: FoodFilters) {
  return useQuery({
    queryKey: foodKeys.nearby(filters),
    queryFn: () => foodService.nearby(filters),
    staleTime: 60_000,
  })
}

export function useFoodListing(id: string) {
  return useQuery({
    queryKey: foodKeys.detail(id),
    queryFn: () => foodService.detail(id),
    staleTime: 5 * 60_000,
    enabled: Boolean(id),
  })
}

export function useDeliveryComparison(id: string, dish?: string, enabled = true) {
  return useQuery({
    queryKey: foodKeys.compareDelivery(id, dish),
    queryFn: () => foodService.compareDelivery(id, dish),
    staleTime: 5 * 60_000,
    enabled: enabled && Boolean(id),
  })
}
