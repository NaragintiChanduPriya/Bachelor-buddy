import {
  AlertTriangle,
  Clock,
  Lightbulb,
  PiggyBank,
  ShoppingCart,
  TrendingDown,
  UtensilsCrossed,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NotificationKind } from '@/types/notification'

interface KindMeta {
  label: string
  icon: LucideIcon
  /** Tile colours; warnings use the amber accent, never red, since nothing here is an error. */
  className: string
}

export const notificationKinds: Record<NotificationKind, KindMeta> = {
  budgetWarning: {
    label: 'Budget warning',
    icon: AlertTriangle,
    className: 'bg-warning/15 text-warning',
  },
  mealSuggestion: {
    label: 'Meal suggestion',
    icon: UtensilsCrossed,
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  priceDrop: {
    label: 'Price drop',
    icon: TrendingDown,
    className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  groceryReminder: {
    label: 'Grocery reminder',
    icon: ShoppingCart,
    className: 'bg-lime-500/10 text-lime-700 dark:text-lime-400',
  },
  offerExpiring: {
    label: 'Offer expiring',
    icon: Clock,
    className: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
  savingsReport: {
    label: 'Savings report',
    icon: PiggyBank,
    className: 'bg-success/15 text-success',
  },
  tip: { label: 'Tip', icon: Lightbulb, className: 'bg-primary/10 text-primary' },
}
