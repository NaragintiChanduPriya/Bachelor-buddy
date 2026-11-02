import { useQuery } from '@tanstack/react-query'
import { savingsService } from '@/lib/api/services/savings'
import { savingsKeys } from '@/lib/api/queryKeys'

export function useMonthlySavings(month?: string) {
  return useQuery({
    queryKey: savingsKeys.monthly(month),
    queryFn: () => savingsService.getMonthly(month),
    staleTime: 60_000,
  })
}

export function useSavingsHistory(months = 6) {
  return useQuery({
    queryKey: savingsKeys.history(months),
    queryFn: () => savingsService.getHistory(months),
    staleTime: 5 * 60_000,
  })
}
