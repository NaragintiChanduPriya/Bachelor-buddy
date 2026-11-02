import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SeoTitle } from '@/components/SeoTitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BudgetBar } from '@/components/BudgetBar'
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
import { useNearbyFood } from '@/features/food/hooks/useFood'
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

  // Lunch near the office: nearest places under a typical lunch cap, honouring the food preference.
  const lunch = useNearbyFood({
    near: 'office',
    sort: 'distance',
    maxPrice: 150,
    veg: me.data?.preferences.foodPreference === 'veg' || undefined,
    pageSize: 3,
  })

  // Only the four day-to-day categories closest to their limit; the Budget page has the rest.
  // Rent is fixed and savings is a set-aside, so neither needs watching here.
  const topCategories =
    budget.data?.categories
      .filter((c) => c.id !== 'savings' && c.id !== 'rent')
      .sort((a, b) => b.percentUsed - a.percentUsed)
      .slice(0, 4) ?? []

  return (
    <div className="space-y-8">
      <SeoTitle title="Dashboard" description="Your monthly money at a glance." />

      {/* Hero */}
      {budget.isError ? (
        <ErrorState
          error={budget.error}
          title="We could not load your budget"
          onRetry={() => void budget.refetch()}
        />
      ) : budget.isPending || me.isPending ? (
        <Skeleton className="h-60 rounded-2xl" />
      ) : (
        <HeroCard budget={budget.data} greeting={greeting} name={me.data?.name ?? 'there'} />
      )}

      <QuickActions onLogExpense={() => setExpenseOpen(true)} />

      {/* Where the money is going, beside savings. */}
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Watch these this month</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/budget">Adjust budget</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {budget.isPending ? (
              <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : budget.isError ? (
              <ErrorState error={budget.error} onRetry={() => void budget.refetch()} />
            ) : (
              <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                {topCategories.map((category) => (
                  <BudgetBar key={category.id} category={category} variant="compact" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {savings.isPending ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : savings.isError ? (
          <ErrorState error={savings.error} onRetry={() => void savings.refetch()} />
        ) : (
          <SavingsGoalCard savings={savings.data} />
        )}
      </div>

      {/* What the agents found today. */}
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
        </div>

        {lunch.isError ? (
          <ErrorState
            error={lunch.error}
            title="We could not find lunch nearby"
            onRetry={() => void lunch.refetch()}
          />
        ) : (
          <CheapMealCard
            listings={lunch.data?.items}
            loading={lunch.isPending}
            officeArea={me.data?.preferences.officeAreaName ?? 'your area'}
          />
        )}
      </div>

      <AddExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} />
    </div>
  )
}
