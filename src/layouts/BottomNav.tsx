import { NavLink } from 'react-router-dom'
import { mobileNav } from './navItems'
import { cn } from '@/utils/cn'

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_-8px_oklch(0_0_0/0.12)] backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {mobileNav.map((item) => {
          const Icon = item.icon
          const centre = item.to === '/chat'
          return (
            <li key={item.to} className="flex justify-center">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex w-full flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex items-center justify-center rounded-full transition-all',
                        centre
                          ? 'bg-brand -mt-5 size-12 text-white shadow-raised ring-4 ring-background'
                          : 'h-7 w-12',
                        !centre && isActive && 'bg-primary/10',
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className={cn(centre && 'font-semibold text-primary')}>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
