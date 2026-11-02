import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { groceryService } from '@/lib/api/services/groceries'
import { groceryKeys } from '@/lib/api/queryKeys'
import type { UpdateGroceryListRequest } from '@/types/grocery'

export function useGroceryList() {
  return useQuery({
    queryKey: groceryKeys.list(),
    queryFn: groceryService.getList,
    staleTime: 60_000,
  })
}

export function useGroceryComparison() {
  return useQuery({
    queryKey: groceryKeys.compare(),
    queryFn: groceryService.compare,
    staleTime: 60_000,
  })
}

/**
 * The whole catalog is small and static, so it is fetched once and searched in the picker
 * without a round trip per keystroke.
 */
export function useGroceryCatalog(enabled = true) {
  return useQuery({
    queryKey: groceryKeys.catalog(),
    queryFn: () => groceryService.catalog(),
    staleTime: Infinity,
    enabled,
  })
}

export function useUpdateGroceryList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateGroceryListRequest) => groceryService.updateList(payload),
    onSuccess: (list) => {
      queryClient.setQueryData(groceryKeys.list(), list)
      // Totals, the store comparison and the bulk saving all move with the list.
      void queryClient.invalidateQueries({ queryKey: groceryKeys.all })
    },
  })
}
