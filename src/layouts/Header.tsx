import { Link } from 'react-router-dom'
import { Bell, Moon, Search, Sun, Wallet2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/store/uiStore'

export function Header() {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
      <Link to="/" className="flex items-center gap-2 lg:hidden">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet2 className="size-4" aria-hidden="true" />
        </span>
        <span className="font-bold">BachelorBuddy</span>
      </Link>

      <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:flex-1">
        <label htmlFor="global-search" className="sr-only">
          Search food, products and homes
        </label>
        <div className="relative hidden w-full max-w-sm sm:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="global-search"
            type="search"
            placeholder="Search meals, products, homes…"
            className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(nextTheme)}
          aria-label={`Switch to ${nextTheme} theme`}
        >
          {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button>

        <Button variant="ghost" size="icon" asChild>
          <Link to="/notifications" aria-label="Notifications">
            <Bell aria-hidden="true" />
          </Link>
        </Button>

        <Link
          to="/settings"
          aria-label="Your profile and settings"
          className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
        >
          A
        </Link>
      </div>
    </header>
  )
}
