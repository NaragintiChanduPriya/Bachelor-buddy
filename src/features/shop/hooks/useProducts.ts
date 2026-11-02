import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/lib/api/services/products'
import { notificationKeys, productKeys } from '@/lib/api/queryKeys'
import type { ProductFilters } from '@/types/product'

export function useProductSearch(filters: ProductFilters) {
  return useQuery({
    queryKey: productKeys.search(filters),
    queryFn: () => productService.search(filters),
    staleTime: 60_000,
    // Keep the old grid on screen while a new filter loads, so the page does not jump.
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.detail(id),
    staleTime: 5 * 60_000,
    enabled: Boolean(id),
  })
}

export function usePriceHistory(id: string, days: number) {
  return useQuery({
    queryKey: productKeys.priceHistory(id, days),
    queryFn: () => productService.priceHistory(id, days),
    // Seeded history never changes within a session.
    staleTime: Infinity,
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  })
}

export function usePriceAlerts() {
  return useQuery({
    queryKey: productKeys.alerts(),
    queryFn: productService.alerts,
    staleTime: 60_000,
  })
}

/** Alerts change the detail's hasAlert flag and the alerts list. */
function invalidateAlertDependents(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  void queryClient.invalidateQueries({ queryKey: productKeys.alerts() })
  void queryClient.invalidateQueries({ queryKey: productKeys.detail(id), exact: true })
  void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
}

export function useSetPriceAlert(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (targetPrice: number) => productService.setAlert(id, { targetPrice }),
    onSuccess: () => invalidateAlertDependents(queryClient, id),
  })
}

export function useRemovePriceAlert(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => productService.removeAlert(id),
    onSuccess: () => invalidateAlertDependents(queryClient, id),
  })
}
