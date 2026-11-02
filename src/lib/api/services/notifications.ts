import { apiGet, apiPatch } from '../client'
import type { NotificationsResponse } from '@/types/notification'

export const notificationService = {
  list: () => apiGet<NotificationsResponse>('/notifications'),
  markRead: (id: string) => apiPatch<NotificationsResponse>(`/notifications/${id}/read`),
  markAllRead: () => apiPatch<NotificationsResponse>('/notifications/read-all'),
}
