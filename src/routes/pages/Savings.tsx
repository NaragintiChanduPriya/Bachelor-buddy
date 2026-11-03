import { BarChart3, Sparkles, TrendingUp } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MoneyText } from '@/components/MoneyText'
import { AgentBadge } from '@/components/AgentBadge'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { agentMeta } from '@/components/agentMeta'
import { GoalProgressCard } from '@/features/savings/components/GoalProgressCard'
import { SavingsTrendChart } from '@/features/savings/components/SavingsTrendChart'
import { ShareSummaryButton } from '@/features/savings/components/ShareSummaryButton'
import { useMonthlySavings, useSavingsHistory } from '@/hooks/useSavings'
import { useMe } from '@/hooks/useMe'
import type { AgentName } from '@/types/chat'
import { formatDate } from '@/utils/date'

function isAgentName(value: string): value is AgentName {
  return value in agentMeta
}

export default function SavingsPage() {
  const monthly = useMonthlySavings()
  const history = useSavingsHistory(6)
  const me = useMe()

  return (
    <div className="space-y-8">
      <SeoTitle title="Savings" description="What you kept back this month, and how." />
      <PageHeader
        title="Savings"
        description={
          monthly.data
            ? `How ${monthly.data.monthLabel} is going against your goal`
            : 'Adding up what you kept back…'
        }
        actions={
          monthly.data ? (
            <ShareSummaryButton savings={monthly.data} name={me.data?.name ?? 'I'} />
          ) : null
        }
      />

      {/* This month vs goal. */}
      {monthly.isPending ? (
        <Skeleton className="h-56 rounded-xl" />
      ) : monthly.isError ? (
        <ErrorState
          error={monthly.error}
          title="We could not load this month's savings"
          onRetry={() => void monthly.refetch()}
        />
      ) : (
        <GoalProgressCard savings={monthly.data} />
      )}

      {/* Breakdowns. */}
      {monthly.data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="size-4 text-muted-foreground" aria-hidden="true" />
                By category
              </CardTitle>
              <CardDescription>Where this month&rsquo;s savings came from</CardDescription>
            </CardHeader>
            <CardContent>
              {monthly.data.byCategory.length === 0 ? (
                <EmptyState
                  title="No savings yet this month"
                  description="Spend under a category limit and it shows up here."
                />
              ) : (
                <ul className="space-y-4">
                  {monthly.data.byCategory.map((row) => (
                    <li key={row.category} className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-medium">{row.label}</span>
                        <span className="flex items-baseline gap-2">
                          <MoneyText amount={row.saved} size="sm" className="font-semibold" />
                          <span className="tabular w-9 text-right text-xs text-muted-foreground">
                            {row.percentOfTotal}%
                          </span>
                        </span>
                      </div>
                      <div
                        className="h-2 w-full overflow-hidden rounded-full bg-muted"
                        role="img"
                        aria-label={`${row.label}: ${row.percentOfTotal}% of this month's savings`}
                      >
                        <div
                          className="h-full rounded-full bg-success"
                          style={{ width: `${Math.min(100, row.percentOfTotal)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
                Recommendations you followed
              </CardTitle>
              <CardDescription>Each one an agent suggested, and what it saved</CardDescription>
            </CardHeader>
            <CardContent>
              {monthly.data.byRecommendation.length === 0 ? (
                <EmptyState
                  title="Nothing followed yet"
                  description="Try one of Buddy's suggestions and the saving will show up here."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {monthly.data.byRecommendation.map((rec) => (
                    <li key={rec.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-medium leading-snug">{rec.title}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {isAgentName(rec.agent) ? <AgentBadge agent={rec.agent} /> : null}
                          <span>Followed {formatDate(rec.followedAt)}</span>
                        </div>
                      </div>
                      <MoneyText
                        amount={rec.saved}
                        size="sm"
                        tone="success"
                        signed
                        className="shrink-0 font-semibold"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Six-month trend. */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-muted-foreground" aria-hidden="true" />
            Saved each month
          </CardTitle>
          <CardDescription>
            {history.data ? (
              <>
                <MoneyText amount={history.data.totalSaved} size="sm" className="font-medium text-foreground" />{' '}
                saved over six months · about{' '}
                <MoneyText amount={history.data.averageSaved} size="sm" className="font-medium text-foreground" />{' '}
                a month · best month {history.data.bestMonth}
              </>
            ) : (
              'The last six months against your goal'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.isPending ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : history.isError ? (
            <ErrorState
              error={history.error}
              title="We could not load your savings history"
              onRetry={() => void history.refetch()}
            />
          ) : history.data.months.length === 0 ? (
            <EmptyState title="No history yet" description="Your first month will appear here." />
          ) : (
            <SavingsTrendChart history={history.data} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
