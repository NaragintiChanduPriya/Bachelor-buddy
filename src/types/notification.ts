import type { AgentName } from './chat'

export type NotificationKind =
  | 'budgetWarning'
  | 'mealSuggestion'
  | 'priceDrop'
  | 'groceryReminder'
  | 'offerExpiring'
  | 'savingsReport'
  | 'tip'

export interface AgentNotification {
  id: string
  kind: NotificationKind
  agent: AgentName
  title: string
  body: string
  link: string | null
  read: boolean
  createdAt: string
}

export interface NotificationsResponse {
  items: AgentNotification[]
  unreadCount: number
  /** The server's current time, so the UI renders relative times against the same clock. */
  serverNow: string
}
