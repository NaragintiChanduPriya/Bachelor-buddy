import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export interface FilterBarProps {
  children: React.ReactNode
  /** Number of filters currently applied; shows the clear button when above zero. */
  activeCount?: number
  onClear?: () => void
  className?: string
}

/** Shared shell for the filter rows on the food, shop and homes pages. */
export function FilterBar({ children, activeCount = 0, onClear, className }: FilterBarProps) {
  return (
    <section
      aria-label="Filters"
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4',
        className,
      )}
    >
      {children}
      {activeCount > 0 && onClear ? (
        <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto">
          <X aria-hidden="true" />
          Clear {activeCount} {activeCount === 1 ? 'filter' : 'filters'}
        </Button>
      ) : null}
    </section>
  )
}
