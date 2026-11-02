import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/lib/api/services/notifications'
import { notificationKeys } from '@/lib/api/queryKeys'

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: notificationService.list,
    staleTime: 30_000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: (data) => queryClient.setQueryData(notificationKeys.list(), data),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: (data) => queryClient.setQueryData(notificationKeys.list(), data),
  })
}
