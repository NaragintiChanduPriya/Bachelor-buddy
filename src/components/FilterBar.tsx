import { useEffect, useId, useRef, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export interface FilterBarProps {
  /** The filter fields. They render inside the panel, stacked. */
  children: React.ReactNode
  /** Number of filters currently applied; shown on the button. */
  activeCount?: number
  onClear?: () => void
  className?: string
}

/**
 * One compact "Filters" button that opens the secondary filters: a popover anchored to the
 * button on desktop, a bottom sheet on phones. Filters apply as they change (they live in the
 * URL), so the panel only needs a Done button. Escape and an outside click close it.
 */
export function FilterBar({ children, activeCount = 0, onClear, className }: FilterBarProps) {
  const [open, setOpen] = useState(false)
  // Which edge of the button the popover lines up with, so it always opens toward free space.
  const [align, setAlign] = useState<'start' | 'end'>('end')
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element
      // A dropdown inside the panel renders its list in a portal; picking from it is not "outside".
      if (target.closest?.('[data-floating-layer]')) return
      if (!rootRef.current?.contains(target)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    const timer = setTimeout(() => {
      document
        .getElementById(panelId)
        ?.querySelector<HTMLElement>('input, select')
        ?.focus()
    }, 0)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      clearTimeout(timer)
    }
  }, [open, panelId])

  const toggle = () => {
    if (!open) {
      const rect = buttonRef.current?.getBoundingClientRect()
      setAlign(rect && rect.left + rect.width / 2 < window.innerWidth / 2 ? 'start' : 'end')
    }
    setOpen((value) => !value)
  }

  return (
    <div ref={rootRef} className={cn('relative inline-block shrink-0', className)}>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        size="sm"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn('h-9 px-3 text-sm', activeCount > 0 && 'border-primary/40')}
      >
        <SlidersHorizontal aria-hidden="true" />
        Filters
        {activeCount > 0 ? (
          <span className="tabular flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {activeCount}
            <span className="sr-only"> applied</span>
          </span>
        ) : null}
      </Button>

      {open ? (
        <>
          {/* Phone backdrop; the panel is a bottom sheet there. */}
          <div className="fixed inset-0 z-40 bg-black/30 sm:hidden" aria-hidden="true" />
          <section
            id={panelId}
            aria-label="Filters"
            className={cn(
              'z-50 space-y-3 border border-border bg-popover p-4 shadow-raised',
              'fixed inset-x-0 bottom-0 rounded-t-2xl pb-[calc(1rem+env(safe-area-inset-bottom))]',
              'sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:mt-2 sm:w-72 sm:rounded-xl sm:pb-4',
              align === 'start' ? 'sm:left-0' : 'sm:right-0',
            )}
          >
            <p className="text-sm font-semibold">Filters</p>

            <div className="space-y-3 [&_input:not([type=checkbox])]:h-9 [&_label]:text-sm [&_label]:font-medium [&_select]:h-9 [&>div]:w-full [&>div]:min-w-0 [&>div]:max-w-none">
              {children}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
              {activeCount > 0 && onClear ? (
                <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                  Clear all
                </Button>
              ) : null}
              <Button type="button" size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}

export interface FilterChip {
  key: string
  label: string
  onRemove: () => void
}

/** The filters currently applied, each removable in one click. Renders nothing when empty. */
export function FilterChips({ chips, className }: { chips: FilterChip[]; className?: string }) {
  if (chips.length === 0) return null
  return (
    <ul aria-label="Applied filters" className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove filter: ${chip.label}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-3 pr-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40"
          >
            {chip.label}
            <X className="size-3 text-muted-foreground" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )
}
