import { QueryClient } from '@tanstack/react-query'
import { isApiError } from './ApiError'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // A 404 or validation error will not fix itself; network blips might.
        if (isApiError(error) && !error.isRetryable) return false
        return failureCount < 2
      },
    },
    mutations: { retry: 0 },
  },
})
