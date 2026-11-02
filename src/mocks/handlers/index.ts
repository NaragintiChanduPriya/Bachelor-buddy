import { budgetHandlers } from './budget'
import { chatHandlers } from './chat'
import { expenseHandlers } from './expenses'
import { foodHandlers } from './food'
import { metaHandlers } from './meta'
import { notificationHandlers } from './notifications'
import { savingsHandlers } from './savings'
import { userHandlers } from './user'

/**
 * Order matters: MSW matches in order, so `/notifications/read-all` must be registered
 * before `/notifications/:id/read` would swallow it. Each file keeps its own internal order.
 */
export const handlers = [
  ...metaHandlers,
  ...userHandlers,
  ...budgetHandlers,
  ...expenseHandlers,
  ...foodHandlers,
  ...chatHandlers,
  ...savingsHandlers,
  ...notificationHandlers,
]
