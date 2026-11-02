import { motion, useReducedMotion } from 'framer-motion'
import { CalendarCheck, Target } from 'lucide-react'
import type { MonthlySavings } from '@/types/savings'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MoneyText } from '@/components/MoneyText'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** This month against the goal. The percentage is the server's; the ring only draws it. */
export function GoalProgressCard({ savings }: { savings: MonthlySavings }) {
  const reduceMotion = useReducedMotion()
  const percent = Math.min(100, Math.max(0, savings.percentOfGoal))
  const offset = CIRCUMFERENCE * (1 - percent / 100)

  return (
    <Card className="overflow-hidden border-success/20 bg-gradient-to-br from-success/10 via-card to-card">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <div
          role="progressbar"
          aria-valuenow={savings.percentOfGoal}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${savings.percentOfGoal}% of your ${savings.monthLabel} savings goal reached`}
          className="relative mx-auto size-36 shrink-0 sm:mx-0"
        >
          <svg viewBox="0 0 128 128" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="64" cy="64" r={RADIUS} fill="none" strokeWidth="10" className="stroke-muted" />
            <motion.circle
              cx="64"
              cy="64"
              r={RADIUS}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className="stroke-success"
              strokeDasharray={CIRCUMFERENCE}
              initial={reduceMotion ? false : { strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: reduceMotion ? 0 : 0.9, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular text-3xl font-bold tracking-tight">{savings.percentOfGoal}%</span>
            <span className="text-xs text-muted-foreground">of goal</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">Saved so far in {savings.monthLabel}</p>
            <Badge variant={savings.onTrack ? 'success' : 'warning'}>
              {savings.onTrack ? 'On track' : 'Behind pace'}
            </Badge>
          </div>
          <MoneyText amount={savings.saved} size="hero" tone="success" />
          <p className="text-sm text-muted-foreground">{savings.headline}</p>

          <dl className="grid gap-3 border-t border-border/60 pt-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-muted-foreground" aria-hidden="true" />
              <dt className="text-muted-foreground">Monthly goal</dt>
              <dd className="ml-auto sm:ml-0">
                <MoneyText amount={savings.goal} size="sm" className="font-semibold" />
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="size-4 text-muted-foreground" aria-hidden="true" />
              <dt className="text-muted-foreground">Projected by month end</dt>
              <dd className="ml-auto sm:ml-0">
                <MoneyText
                  amount={savings.projectedByMonthEnd}
                  size="sm"
                  tone={savings.onTrack ? 'success' : 'warning'}
                  className="font-semibold"
                />
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  )
}
