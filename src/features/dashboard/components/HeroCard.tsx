import { CalendarDays, TrendingUp } from 'lucide-react'
import type { Budget } from '@/types/budget'
import { Card, CardContent } from '@/components/ui/card'
import { MoneyText } from '@/components/MoneyText'

/** The "₹X left this month" card. Every number is computed by the backend. */
export function HeroCard({ budget, greeting, name }: { budget: Budget; greeting: string; name: string }) {
  const tone =
    budget.percentUsed >= 90 ? 'danger' : budget.percentUsed >= 70 ? 'warning' : 'success'

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {greeting}, {name}
          </p>
          <p className="text-sm text-muted-foreground">You have</p>
          <MoneyText amount={budget.totalRemaining} size="hero" tone={tone} />
          <p className="text-sm text-muted-foreground">left this month</p>
        </div>

        <div className="flex flex-wrap gap-4 border-t border-border/60 pt-4 text-sm">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
            <strong className="tabular">{budget.daysLeftInMonth}</strong>
            <span className="text-muted-foreground">days left</span>
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="size-4 text-muted-foreground" aria-hidden="true" />
            <MoneyText amount={budget.dailySafeSpend} size="sm" />
            <span className="text-muted-foreground">a day keeps you on track</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
