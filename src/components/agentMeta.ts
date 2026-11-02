import {
  Bot,
  Home as HomeIcon,
  PiggyBank,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AgentName } from '@/types/chat'

interface AgentMeta {
  label: string
  icon: LucideIcon
  className: string
}

/** The eight agents from CLAUDE.md, each with a stable colour and icon. */
export const agentMeta: Record<AgentName, AgentMeta> = {
  concierge: { label: 'Concierge', icon: Bot, className: 'bg-primary/10 text-primary' },
  budget: { label: 'Budget', icon: Wallet, className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  food: {
    label: 'Food',
    icon: UtensilsCrossed,
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  grocery: {
    label: 'Grocery',
    icon: ShoppingCart,
    className: 'bg-lime-500/10 text-lime-700 dark:text-lime-400',
  },
  shopping: {
    label: 'Shopping',
    icon: ShoppingBag,
    className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  deals: {
    label: 'Deals',
    icon: Sparkles,
    className: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
  home: {
    label: 'Home',
    icon: HomeIcon,
    className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  },
  savings: { label: 'Savings', icon: PiggyBank, className: 'bg-success/10 text-success' },
}
