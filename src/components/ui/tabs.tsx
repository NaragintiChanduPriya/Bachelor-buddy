import { cn } from '@/utils/cn'

export interface TabItem<T extends string> {
  value: T
  label: string
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}

/**
 * Roving-tabindex tab list. Arrow keys move between tabs, matching the ARIA pattern, which
 * the native-select fallback would not give us here.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: TabsProps<T>) {
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const index = items.findIndex((item) => item.value === value)
    if (index === -1) return

    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % items.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = items.length - 1
    else return

    event.preventDefault()
    onChange(items[next]!.value)

    // Follow the selection with focus, as the ARIA tabs pattern expects.
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    tabs?.[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'inline-flex w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1 sm:w-auto',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={selected}
            // Roving tabindex: only the selected tab is in the tab order, and the arrow keys
            // move between tabs from whichever one has focus.
            tabIndex={selected ? 0 : -1}
            onKeyDown={onKeyDown}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none',
              selected
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
