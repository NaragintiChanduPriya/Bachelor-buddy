import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { budgetService } from '@/lib/api/services/budget'
import { budgetKeys, expenseKeys, savingsKeys } from '@/lib/api/queryKeys'
import type { UpdateBudgetRequest } from '@/types/budget'

export function useBudget() {
  return useQuery({
    queryKey: budgetKeys.current(),
    queryFn: budgetService.getCurrent,
    staleTime: 30_000,
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateBudgetRequest) => budgetService.update(payload),
    onSuccess: (budget) => {
      queryClient.setQueryData(budgetKeys.current(), budget)
      // Changing a limit changes how much is "saved", and the expense views show limits.
      void queryClient.invalidateQueries({ queryKey: savingsKeys.all })
      void queryClient.invalidateQueries({ queryKey: expenseKeys.all })
    },
  })
}
