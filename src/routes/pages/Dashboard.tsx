import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, TrendingDown, Wallet } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BudgetBar } from '@/components/BudgetBar'
import { StatCard } from '@/components/StatCard'
import { ErrorState } from '@/components/ErrorState'
import { HeroCard } from '@/features/dashboard/components/HeroCard'
import { QuickActions } from '@/features/dashboard/components/QuickActions'
import { CheapMealCard } from '@/features/dashboard/components/CheapMealCard'
import { SavingsGoalCard } from '@/features/dashboard/components/SavingsGoalCard'
import { AlertsCard } from '@/features/dashboard/components/AlertsCard'
import { AddExpenseDialog } from '@/features/expenses/components/AddExpenseDialog'
import { useBudget } from '@/features/budget/hooks/useBudget'
import { useMe } from '@/hooks/useMe'
import { useMonthlySavings } from '@/hooks/useSavings'
import { useNotifications } from '@/hooks/useNotifications'
import { formatINR } from '@/utils/currency'
import { greetingForHour } from '@/utils/date'

export default function DashboardPage() {
  const [expenseOpen, setExpenseOpen] = useState(false)
  const me = useMe()
  const budget = useBudget()
  const savings = useMonthlySavings()
  const notifications = useNotifications()

  // The greeting follows the server clock, which in mock mode is 12:30 PM IST.
  const serverNow = notifications.data?.serverNow
  const now = serverNow ? new Date(serverNow) : new Date()
  const hourIST = Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    }).format(now),
  )
  const greeting = greetingForHour(hourIST)

  const mealAlert = notifications.data?.items.find((n) => n.kind === 'mealSuggestion')
  const topCategories = budget.data?.categories.filter((c) => c.id !== 'savings').slice(0, 7) ?? []

  return (
    <div className="space-y-6">
      <SeoTitle title="Dashboard" description="Your monthly money at a glance." />

      {/* Hero */}
      {budget.isError ? (
        <ErrorState
          error={budget.error}
          title="We could not load your budget"
          onRetry={() => void budget.refetch()}
        />
      ) : budget.isPending || me.isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : (
        <HeroCard budget={budget.data} greeting={greeting} name={me.data?.name ?? 'there'} />
      )}

      <QuickActions onLogExpense={() => setExpenseOpen(true)} />

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budget.isPending ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : budget.data ? (
          <>
            <StatCard
              label="Spent this month"
              amount={budget.data.totalSpent}
              hint={`${budget.data.percentUsed}% of your ${formatINR(budget.data.totalLimit)} plan`}
              icon={Receipt}
            />
            <StatCard
              label="Safe to spend daily"
              amount={budget.data.dailySafeSpend}
              hint={`Across ${budget.data.daysLeftInMonth} days left`}
              icon={Wallet}
              tone="primary"
            />
            <StatCard
              label="Saved so far"
              amount={savings.data?.saved ?? 0}
              hint={savings.data ? `${savings.data.percentOfGoal}% of your goal` : 'Loading…'}
              icon={TrendingDown}
              tone="success"
            />
          </>
        ) : null}
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Where your money is going</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/budget">Adjust</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {budget.isPending ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)
            ) : budget.isError ? (
              <ErrorState error={budget.error} onRetry={() => void budget.refetch()} />
            ) : (
              topCategories.map((category) => (
                <BudgetBar key={category.id} category={category} />
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {savings.isPending ? (
            <Skeleton className="h-56 rounded-xl" />
          ) : savings.isError ? (
            <ErrorState error={savings.error} onRetry={() => void savings.refetch()} />
          ) : (
            <SavingsGoalCard savings={savings.data} />
          )}

          {mealAlert ? (
            <CheapMealCard title={mealAlert.title} body={mealAlert.body} link={mealAlert.link} />
          ) : notifications.isPending ? (
            <Skeleton className="h-44 rounded-xl" />
          ) : null}
        </div>
      </div>

      {notifications.isPending ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : notifications.isError ? (
        <ErrorState
          error={notifications.error}
          title="We could not load your alerts"
          onRetry={() => void notifications.refetch()}
        />
      ) : (
        <AlertsCard notifications={notifications.data.items} now={now} />
      )}

      <AddExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} />
    </div>
  )
}
