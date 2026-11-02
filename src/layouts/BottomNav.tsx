import { NavLink } from 'react-router-dom'
import { mobileNav } from './navItems'
import { cn } from '@/utils/cn'

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
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
                        'flex items-center justify-center rounded-full transition-colors',
                        centre
                          ? 'size-10 -mt-4 bg-primary text-primary-foreground shadow-lg'
                          : 'size-6',
                        !centre && isActive && 'text-primary',
                      )}
                    >
                      <Icon className={centre ? 'size-5' : 'size-5'} aria-hidden="true" />
                    </span>
                    <span>{item.label}</span>
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
