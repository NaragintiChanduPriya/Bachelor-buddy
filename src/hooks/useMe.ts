import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService, type OnboardingPayload } from '@/lib/api/services/user'
import { budgetKeys, savingsKeys, userKeys } from '@/lib/api/queryKeys'

export function useMe() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: userService.getMe,
    staleTime: 5 * 60_000,
  })
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OnboardingPayload) => userService.completeOnboarding(payload),
    onSuccess: ({ user, budget }) => {
      queryClient.setQueryData(userKeys.me(), user)
      queryClient.setQueryData(budgetKeys.current(), budget)
      void queryClient.invalidateQueries({ queryKey: savingsKeys.all })
    },
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<OnboardingPayload>) => userService.updatePreferences(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.me(), user)
      // Salary or goal changes regenerate the budget split server-side.
      void queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      void queryClient.invalidateQueries({ queryKey: savingsKeys.all })
    },
  })
}
