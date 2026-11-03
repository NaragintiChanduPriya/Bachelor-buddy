import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Menu, Moon, Search, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from './BrandMark'
import { useUiStore } from '@/store/uiStore'
import { useNotifications } from '@/hooks/useNotifications'

/** Resolves "system" to what is actually on screen, so the toggle always flips the visible theme. */
function isDarkNow(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}

/**
 * Top bar: search on the left, actions pinned to the right. The profile lives in the sidebar
 * only, so it is not repeated here.
 */
export function Header() {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen)
  const notifications = useNotifications()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const dark = theme === 'dark' || (theme === 'system' && isDarkNow())
  const nextTheme = dark ? 'light' : 'dark'
  const unread = notifications.data?.unreadCount ?? 0

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const term = query.trim()
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            className="-ml-2 lg:hidden"
          >
            <Menu aria-hidden="true" />
          </Button>
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 lg:hidden"
            aria-label="BachelorBuddy home"
          >
            <BrandMark className="size-8" />
            <span className="font-semibold tracking-tight">BachelorBuddy</span>
          </Link>

          <form role="search" onSubmit={onSearch} className="hidden w-full max-w-md sm:block">
            <label htmlFor="global-search" className="sr-only">
              Search products to compare prices
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="global-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products to compare prices"
                className="h-10 w-full rounded-lg border border-input bg-muted/40 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground hover:bg-muted/60 focus-visible:border-ring focus-visible:bg-card"
              />
            </div>
          </form>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(nextTheme)}
            aria-label={`Switch to ${nextTheme} theme`}
          >
            {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link
              to="/notifications"
              aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            >
              <Bell aria-hidden="true" />
              {unread > 0 ? (
                <span
                  aria-hidden="true"
                  className="tabular absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground ring-2 ring-background"
                >
                  {unread > 9 ? '9+' : unread}
                </span>
              ) : null}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
