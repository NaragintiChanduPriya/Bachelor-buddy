import { motion, useReducedMotion } from 'framer-motion'
import { CircleCheck } from 'lucide-react'
import type { StoreTotal } from '@/types/grocery'
import { Badge } from '@/components/ui/badge'
import { MoneyText } from '@/components/MoneyText'
import { storeKindMeta } from '../utils/storeMeta'
import { cn } from '@/utils/cn'

export interface StoreTotalsGridProps {
  storeTotals: StoreTotal[]
  itemCount: number
  className?: string
}

/** One card per store type: the whole list bought there, against the cheapest single store. */
export function StoreTotalsGrid({ storeTotals, itemCount, className }: StoreTotalsGridProps) {
  const reduceMotion = useReducedMotion()

  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2', className)}>
      {storeTotals.map((store, index) => {
        const meta = storeKindMeta[store.store]
        const Icon = meta.icon
        return (
          <motion.li
            key={store.store}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, delay: reduceMotion ? 0 : index * 0.05 }}
            className={cn(
              'relative space-y-3 rounded-xl border bg-card p-4 shadow-sm',
              store.isCheapest ? 'border-success/50 ring-1 ring-success/30' : 'border-border',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    meta.iconClassName,
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{store.label}</p>
                  <p className="text-xs text-muted-foreground">{meta.kind}</p>
                </div>
              </div>
              {store.isCheapest ? (
                <Badge variant="success" className="shrink-0">
                  <CircleCheck className="size-3" aria-hidden="true" />
                  Cheapest
                </Badge>
              ) : null}
            </div>

            <div className="space-y-0.5">
              <MoneyText amount={store.total} size="xl" tone={store.isCheapest ? 'success' : 'default'} />
              <p className="text-xs text-muted-foreground">
                {store.isCheapest ? (
                  'Lowest whole-list total'
                ) : (
                  <>
                    <MoneyText amount={store.differenceFromCheapest} size="sm" tone="warning" /> more
                    than the cheapest store
                  </>
                )}
              </p>
            </div>

            <p className="border-t border-border pt-2 text-xs text-muted-foreground">
              Cheapest for{' '}
              <strong className="tabular font-semibold text-foreground">
                {store.cheapestItemCount}
              </strong>{' '}
              of {itemCount} {itemCount === 1 ? 'item' : 'items'} · {meta.note}
            </p>
          </motion.li>
        )
      })}
    </ul>
  )
}
