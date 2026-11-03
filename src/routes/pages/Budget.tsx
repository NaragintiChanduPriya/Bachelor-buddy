import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { BudgetBar } from '@/components/BudgetBar'
import { MoneyText } from '@/components/MoneyText'
import { ErrorState } from '@/components/ErrorState'
import { useBudget, useUpdateBudget } from '@/features/budget/hooks/useBudget'
import { isApiError } from '@/lib/api/ApiError'
import type { BudgetCategoryId } from '@/types/budget'
import { formatINR } from '@/utils/currency'
import { formatMonthLabel } from '@/utils/date'
import { cn } from '@/utils/cn'

export default function BudgetPage() {
  const budget = useBudget()
  const updateBudget = useUpdateBudget()
  // `null` means "not editing". Entering edit mode seeds the draft from the server's numbers,
  // so there is no effect syncing server state into local state.
  const [draft, setDraft] = useState<Record<string, number> | null>(null)
  const editing = draft !== null
  const limits = draft ?? {}

  const startEditing = () => {
    if (!budget.data) return
    setDraft(Object.fromEntries(budget.data.categories.map((c) => [c.id, c.limit])))
  }

  const draftTotal = Object.values(limits).reduce((sum, value) => sum + (value || 0), 0)
  const salary = budget.data?.salary ?? 0
  const overBudget = draftTotal > salary

  const save = () => {
    const categories = Object.entries(limits).map(([id, limit]) => ({
      id: id as BudgetCategoryId,
      limit: Math.round(limit) || 0,
    }))
    updateBudget.mutate({ categories }, { onSuccess: () => setDraft(null) })
  }

  const cancelEditing = () => {
    setDraft(null)
    updateBudget.reset()
  }

  const serverError = updateBudget.isError
    ? isApiError(updateBudget.error)
      ? updateBudget.error.message
      : 'We could not save those limits.'
    : null

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <SeoTitle title="Budget" description="Your monthly category limits." />
      <PageHeader
        title="Budget"
        description={
          budget.data ? `Your plan for ${formatMonthLabel(budget.data.month)}` : undefined
        }
        actions={
          budget.data && !editing ? (
            <Button variant="outline" onClick={startEditing}>
              Adjust limits
            </Button>
          ) : null
        }
      />

      {budget.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : budget.isError ? (
        <ErrorState error={budget.error} onRetry={() => void budget.refetch()} />
      ) : (
        <>
          <Card>
            <CardContent className="grid gap-5 p-6 sm:grid-cols-3 sm:divide-x sm:divide-border">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monthly salary</p>
                <MoneyText amount={budget.data.salary} size="lg" className="block" />
              </div>
              <div className="space-y-1 sm:pl-6">
                <p className="text-sm text-muted-foreground">Spent so far</p>
                <MoneyText amount={budget.data.totalSpent} size="lg" className="block" />
                <p className="text-xs text-muted-foreground">
                  {budget.data.percentUsed}% of your plan
                </p>
              </div>
              <div className="space-y-1 sm:pl-6">
                <p className="text-sm text-muted-foreground">Still available</p>
                <MoneyText
                  amount={budget.data.totalRemaining}
                  size="lg"
                  tone="success"
                  className="block"
                />
                <p className="text-xs text-muted-foreground">
                  {budget.data.daysLeftInMonth} days left
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="size-4 text-muted-foreground" aria-hidden="true" />
                {editing ? 'Adjust your category limits' : 'Category budgets'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {editing ? (
                <>
                  <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    {budget.data.categories.map((category) => (
                      <div key={category.id} className="flex items-center gap-3">
                        <label
                          htmlFor={`limit-${category.id}`}
                          className="flex-1 text-sm font-medium"
                        >
                          {category.label}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            spent {formatINR(category.spent)}
                          </span>
                        </label>
                        <Input
                          id={`limit-${category.id}`}
                          type="number"
                          inputMode="numeric"
                          className="w-32"
                          value={limits[category.id] ?? 0}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...(prev ?? {}),
                              [category.id]: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-3 text-sm',
                      overBudget
                        ? 'border-destructive/40 bg-destructive/5'
                        : 'border-border bg-muted/40',
                    )}
                  >
                    <span>Total allocated</span>
                    <span className="flex items-center gap-2">
                      <MoneyText
                        amount={draftTotal}
                        size="md"
                        tone={overBudget ? 'danger' : 'default'}
                      />
                      <span className="text-muted-foreground">
                        of <MoneyText amount={salary} size="sm" tone="muted" />
                      </span>
                    </span>
                  </div>

                  {overBudget ? (
                    <p role="alert" className="text-sm text-destructive">
                      Your limits add up to more than your salary. Reduce them by{' '}
                      <MoneyText amount={draftTotal - salary} size="sm" tone="danger" />.
                    </p>
                  ) : null}

                  {serverError ? (
                    <p
                      role="alert"
                      className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                    >
                      {serverError}
                    </p>
                  ) : null}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                    <Button disabled={overBudget || updateBudget.isPending} onClick={save}>
                      {updateBudget.isPending ? 'Saving…' : 'Save limits'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                  {budget.data.categories.map((category) => (
                    <BudgetBar key={category.id} category={category} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
