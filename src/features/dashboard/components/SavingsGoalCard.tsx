import { Link } from 'react-router-dom'
import { PiggyBank } from 'lucide-react'
import type { MonthlySavings } from '@/types/savings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoneyText } from '@/components/MoneyText'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function SavingsGoalCard({ savings }: { savings: MonthlySavings }) {
  const percent = Math.min(100, Math.max(0, savings.percentOfGoal))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <PiggyBank className="size-4 text-success" aria-hidden="true" />
            Savings this month
          </CardTitle>
          <Badge variant={savings.onTrack ? 'success' : 'warning'}>
            {savings.onTrack ? 'On track' : 'Behind'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <MoneyText amount={savings.saved} size="xl" tone="success" />
          <span className="text-sm text-muted-foreground">
            of <MoneyText amount={savings.goal} size="sm" tone="muted" /> goal
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={savings.percentOfGoal}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${savings.percentOfGoal}% of your savings goal reached`}
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full rounded-full bg-success" style={{ width: `${percent}%` }} />
        </div>

        <p className="text-sm text-muted-foreground">{savings.headline}</p>

        <Button asChild variant="ghost" size="sm" className="px-0">
          <Link to="/savings">See the full breakdown</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
