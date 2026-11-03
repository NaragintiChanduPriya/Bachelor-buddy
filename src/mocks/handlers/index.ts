import { budgetHandlers } from './budget'
import { chatHandlers } from './chat'
import { expenseHandlers } from './expenses'
import { foodHandlers } from './food'
import { groceryHandlers } from './groceries'
import { homeHandlers } from './homes'
import { metaHandlers } from './meta'
import { notificationHandlers } from './notifications'
import { offerHandlers } from './offers'
import { productHandlers } from './products'
import { savingsHandlers } from './savings'
import { userHandlers } from './user'

/**
 * Order matters: MSW matches in order, so `/notifications/read-all` must be registered
 * before `/notifications/:id/read` would swallow it, and `/products/alerts` before
 * `/products/:id`. Each file keeps its own internal order.
 */
export const handlers = [
  ...metaHandlers,
  ...userHandlers,
  ...budgetHandlers,
  ...expenseHandlers,
  ...foodHandlers,
  ...groceryHandlers,
  ...productHandlers,
  ...offerHandlers,
  ...homeHandlers,
  ...chatHandlers,
  ...savingsHandlers,
  ...notificationHandlers,
]
