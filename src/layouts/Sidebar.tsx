import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { navSections, type NavItem } from './navItems'
import { BrandMark } from './BrandMark'
import { useUiStore } from '@/store/uiStore'
import { useMe } from '@/hooks/useMe'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/utils/cn'

function NavRow({
  item,
  collapsed,
  unread,
}: {
  item: NavItem
  collapsed: boolean
  unread: number
}) {
  const Icon = item.icon
  const count = item.showUnread ? unread : 0

  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          collapsed && 'justify-center px-2',
          isActive
            ? 'bg-accent font-semibold text-foreground'
            : 'font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative">
            <Icon
              className={cn('size-[18px] shrink-0', isActive && 'text-primary')}
              aria-hidden="true"
            />
            {collapsed && count > 0 ? (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 size-2 rounded-full bg-destructive ring-2 ring-card"
              />
            ) : null}
          </span>
          {!collapsed ? <span className="flex-1 truncate">{item.label}</span> : null}
          {collapsed ? (
            <span className="sr-only">
              {item.label}
              {count > 0 ? `, ${count} unread` : ''}
            </span>
          ) : null}
          {!collapsed && count > 0 ? (
            <span className="tabular rounded-full bg-destructive/10 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-destructive">
              {count}
              <span className="sr-only"> unread</span>
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  )
}

/** Brand, navigation and profile: shared by the desktop sidebar and the mobile drawer. */
function SidebarBody({ collapsed }: { collapsed: boolean }) {
  const me = useMe()
  const notifications = useNotifications()
  const unread = notifications.data?.unreadCount ?? 0
  const prefs = me.data?.preferences

  return (
    <>
      <Link
        to="/"
        aria-label="BachelorBuddy home"
        className={cn('flex h-16 shrink-0 items-center gap-2.5 px-5', collapsed && 'justify-center px-2')}
      >
        <BrandMark />
        {!collapsed ? (
          <span className="text-[17px] font-semibold tracking-tight">BachelorBuddy</span>
        ) : null}
      </Link>

      <nav aria-label="Main" className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4 pt-3">
        {navSections.map((section, index) => (
          <div key={section.title} className={cn(index > 0 && 'mt-6')}>
            {collapsed ? (
              index > 0 ? <hr className="mx-2 mb-4 border-border" /> : null
            ) : (
              <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavRow item={item} collapsed={collapsed} unread={unread} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* The one place the profile lives. */}
      {me.data ? (
        <div className="shrink-0 border-t border-border p-3">
          <Link
            to="/settings"
            title={collapsed ? `${me.data.name} · Settings` : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/60',
              collapsed && 'justify-center',
            )}
          >
            <span className="bg-brand flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
              {me.data.avatarInitials}
            </span>
            {!collapsed ? (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{me.data.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {prefs ? `${prefs.homeAreaName} · ${me.data.occupation}` : me.data.occupation}
                  </span>
                </span>
                <ChevronRight
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </>
            ) : (
              <span className="sr-only">{me.data.name}, profile and settings</span>
            )}
          </Link>
        </div>
      ) : null}
    </>
  )
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggle = useUiStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'group/sidebar sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      <SidebarBody collapsed={collapsed} />
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        className="absolute -right-3 top-5 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 shadow-card transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/sidebar:opacity-100"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-3.5" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="size-3.5" aria-hidden="true" />
        )}
      </button>
    </aside>
  )
}

/** The same sidebar as a slide-over drawer below the lg breakpoint. */
export function MobileSidebar() {
  const open = useUiStore((s) => s.mobileNavOpen)
  const setOpen = useUiStore((s) => s.setMobileNavOpen)
  const { pathname } = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  // Following a link closes the drawer.
  useEffect(() => {
    setOpen(false)
  }, [pathname, setOpen])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => panelRef.current?.querySelector<HTMLElement>('a')?.focus(), 50)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = original
      clearTimeout(timer)
    }
  }, [open, setOpen])

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={reduceMotion ? false : { x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
            className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-card shadow-xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <SidebarBody collapsed={false} />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
