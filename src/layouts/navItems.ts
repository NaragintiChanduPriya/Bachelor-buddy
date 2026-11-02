import {
  Bell,
  Home,
  MessageCircleHeart,
  PiggyBank,
  Receipt,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const primaryNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/chat', label: 'Ask Buddy', icon: MessageCircleHeart },
  { to: '/food', label: 'Food', icon: UtensilsCrossed },
  { to: '/groceries', label: 'Groceries', icon: ShoppingCart },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/deals', label: 'Deals', icon: Sparkles },
  { to: '/homes', label: 'Homes', icon: Store },
]

export const secondaryNav: NavItem[] = [
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/budget', label: 'Budget', icon: Wallet },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
]

/** Mobile bottom bar: Ask Buddy sits in the centre and is highlighted. */
export const mobileNav: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/food', label: 'Food', icon: UtensilsCrossed },
  { to: '/chat', label: 'Ask Buddy', icon: MessageCircleHeart },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
]
