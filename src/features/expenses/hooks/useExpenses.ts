import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { expenseService } from '@/lib/api/services/expenses'
import { budgetKeys, expenseKeys, notificationKeys, savingsKeys } from '@/lib/api/queryKeys'
import type { CreateExpenseRequest, ExpenseFilters } from '@/types/expense'

export function useExpenses(filters: ExpenseFilters) {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => expenseService.list(filters),
    staleTime: 30_000,
  })
}

/** Everything a new expense touches: the expense list, the budget, and savings. */
function invalidateExpenseDependents(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: expenseKeys.all })
  void queryClient.invalidateQueries({ queryKey: budgetKeys.all })
  void queryClient.invalidateQueries({ queryKey: savingsKeys.all })
  void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateExpenseRequest) => expenseService.create(payload),
    onSuccess: () => invalidateExpenseDependents(queryClient),
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => expenseService.remove(id),
    onSuccess: () => invalidateExpenseDependents(queryClient),
  })
}
