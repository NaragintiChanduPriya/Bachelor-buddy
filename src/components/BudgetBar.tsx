import { motion, useReducedMotion } from 'framer-motion'
import type { BudgetCategory } from '@/types/budget'
import { MoneyText } from './MoneyText'
import { cn } from '@/utils/cn'

const trackTone: Record<BudgetCategory['status'], string> = {
  ok: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
}

const labelTone: Record<BudgetCategory['status'], string> = {
  ok: 'text-muted-foreground',
  warning: 'text-warning',
  danger: 'text-destructive',
}

export interface BudgetBarProps {
  category: BudgetCategory
  className?: string
}

/**
 * One category's progress. The percentage and status come from the backend; this only renders.
 * The bar is capped at 100% visually, but an overspend still reads correctly in the text.
 */
export function BudgetBar({ category, className }: BudgetBarProps) {
  const reduceMotion = useReducedMotion()
  const width = Math.min(100, Math.max(0, category.percentUsed))
  const overspent = category.remaining < 0

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{category.label}</span>
        <span className="text-sm text-muted-foreground">
          <MoneyText amount={category.spent} size="sm" />
          <span aria-hidden="true"> / </span>
          <span className="sr-only">of</span>
          <MoneyText amount={category.limit} size="sm" tone="muted" />
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={category.percentUsed}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${category.label}: ${category.percentUsed}% of budget used`}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          className={cn('h-full rounded-full', trackTone[category.status])}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: 'easeOut' }}
        />
      </div>

      <p className={cn('text-xs', labelTone[category.status])}>
        {overspent ? (
          <>
            <MoneyText amount={Math.abs(category.remaining)} size="sm" tone="danger" /> over budget
          </>
        ) : (
          <>
            <MoneyText amount={category.remaining} size="sm" tone="muted" /> left ·{' '}
            {category.percentUsed}% used
          </>
        )}
      </p>
    </div>
  )
}
