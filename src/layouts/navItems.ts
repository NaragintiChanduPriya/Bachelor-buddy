import {
  Bell,
  Building2,
  LayoutDashboard,
  MessageCircleHeart,
  PiggyBank,
  Receipt,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tag,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  /** Shows the unread notification count beside the label. */
  showUnread?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}

/** Desktop sidebar, grouped the way a user thinks about their month. */
export const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/chat', label: 'Ask Buddy', icon: MessageCircleHeart },
    ],
  },
  {
    title: 'Save on',
    items: [
      { to: '/food', label: 'Food', icon: UtensilsCrossed },
      { to: '/groceries', label: 'Groceries', icon: ShoppingCart },
      { to: '/shop', label: 'Shop', icon: ShoppingBag },
      { to: '/deals', label: 'Deals', icon: Tag },
      { to: '/homes', label: 'Homes', icon: Building2 },
    ],
  },
  {
    title: 'Your money',
    items: [
      { to: '/expenses', label: 'Expenses', icon: Receipt },
      { to: '/budget', label: 'Budget', icon: Wallet },
      { to: '/savings', label: 'Savings', icon: PiggyBank },
      { to: '/notifications', label: 'Alerts', icon: Bell, showUnread: true },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

/** Mobile bottom bar: Ask Buddy sits in the centre and is highlighted. */
export const mobileNav: NavItem[] = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/food', label: 'Food', icon: UtensilsCrossed },
  { to: '/chat', label: 'Ask Buddy', icon: MessageCircleHeart },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
]
