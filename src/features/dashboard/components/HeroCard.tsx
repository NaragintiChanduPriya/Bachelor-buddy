import { motion, useReducedMotion } from 'framer-motion'
import { CalendarDays, TrendingUp } from 'lucide-react'
import type { Budget } from '@/types/budget'
import { MoneyText } from '@/components/MoneyText'
import { formatMonthLabel } from '@/utils/date'

const statusCopy = {
  ok: { label: 'On track', dot: 'bg-emerald-300' },
  warning: { label: 'Watch your spending', dot: 'bg-amber-300' },
  danger: { label: 'Close to your limit', dot: 'bg-rose-300' },
} as const

/** The "₹X left this month" card. Every number is computed by the backend. */
export function HeroCard({ budget, greeting, name }: { budget: Budget; greeting: string; name: string }) {
  const reduceMotion = useReducedMotion()
  const status = budget.percentUsed >= 90 ? 'danger' : budget.percentUsed >= 70 ? 'warning' : 'ok'
  const copy = statusCopy[status]
  const width = Math.min(100, Math.max(0, budget.percentUsed))

  return (
    <section
      aria-label="This month's money"
      className="bg-hero relative overflow-hidden rounded-2xl p-6 text-white shadow-raised sm:p-8"
    >
      {/* Decorative depth; purely visual. */}
      <span aria-hidden="true" className="absolute -right-16 -top-20 size-64 rounded-full bg-white/[0.07]" />
      <span aria-hidden="true" className="absolute -bottom-24 right-24 size-56 rounded-full bg-white/[0.05]" />

      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-2">
          <p className="text-sm font-medium text-white/85">
            {greeting}, {name}
          </p>
          <p className="text-sm text-white/80">You have</p>
          <MoneyText amount={budget.totalRemaining} size="hero" className="block text-white" />
          <p className="flex flex-wrap items-center gap-2 text-sm text-white/85">
            <span>left this month</span>
            <span className="text-white/60" aria-hidden="true">
              ·
            </span>
            <span>{formatMonthLabel(budget.month)}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white">
              <span className={`size-1.5 rounded-full ${copy.dot}`} aria-hidden="true" />
              {copy.label}
            </span>
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:w-80">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <dt className="flex items-center gap-1.5 text-xs text-white/80">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Days left
            </dt>
            <dd className="tabular mt-1 text-lg font-semibold">{budget.daysLeftInMonth}</dd>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <dt className="flex items-center gap-1.5 text-xs text-white/80">
              <TrendingUp className="size-3.5" aria-hidden="true" />
              Safe daily
            </dt>
            <dd className="mt-1">
              <MoneyText amount={budget.dailySafeSpend} size="lg" className="text-white" />
            </dd>
          </div>
        </dl>
      </div>

      <div className="relative mt-6 space-y-1.5">
        <div
          role="progressbar"
          aria-valuenow={budget.percentUsed}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${budget.percentUsed}% of this month's plan used`}
          className="h-2 w-full overflow-hidden rounded-full bg-white/20"
        >
          <motion.div
            className="h-full rounded-full bg-white"
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${width}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="flex justify-between text-xs text-white/80">
          <span>
            <span className="tabular font-semibold text-white">{budget.percentUsed}%</span> of your
            plan used
          </span>
          <span>
            Plan <MoneyText amount={budget.totalLimit} size="sm" className="text-xs text-white/90" />
          </span>
        </p>
      </div>
    </section>
  )
}
