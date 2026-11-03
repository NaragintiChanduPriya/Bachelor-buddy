import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Receipt } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal } from '@/components/ui/modal'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { MoneyText } from '@/components/MoneyText'
import { Pagination } from '@/components/Pagination'
import { ExpenseList } from '@/features/expenses/components/ExpenseList'
import { AddExpenseDialog } from '@/features/expenses/components/AddExpenseDialog'
import { useDeleteExpense, useExpenses } from '@/features/expenses/hooks/useExpenses'
import { categoryIds, categoryLabels } from '@/utils/categories'
import type { BudgetCategoryId } from '@/types/budget'
import type { Expense } from '@/types/expense'
import { formatMonthLabel } from '@/utils/date'
import { cn } from '@/utils/cn'

export default function ExpensesPage() {
  // URL query params are the source of truth for list filters.
  const [params, setParams] = useSearchParams()
  const category = (params.get('category') ?? 'all') as BudgetCategoryId | 'all'
  const month = params.get('month') ?? undefined
  const page = Number(params.get('page') ?? 1)

  const [addOpen, setAddOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null)

  const expenses = useExpenses({ category, month, page, pageSize: 20 })
  const deleteExpense = useDeleteExpense()

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all' || value === '') next.delete(key)
    else next.set(key, value)
    next.delete('page')
    setParams(next, { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <SeoTitle title="Expenses" description="Everything you spent this month." />
      <PageHeader
        title="Expenses"
        description={
          expenses.data
            ? `${expenses.data.meta.total} expenses${month ? ` in ${formatMonthLabel(month)}` : ' this month'}`
            : undefined
        }
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden="true" />
            Add expense
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label htmlFor="filter-category" className="sr-only">
            Category
          </label>
          <Select
            id="filter-category"
            value={category}
            onValueChange={(value) => setParam('category', value)}
            className="h-9 w-auto min-w-[11rem]"
          >
            <option value="all">All categories</option>
            {categoryIds.map((id) => (
              <option key={id} value={id}>
                {categoryLabels[id]}
              </option>
            ))}
          </Select>
        </div>

        {expenses.data ? (
          <p className="text-sm text-muted-foreground">
            Total{' '}
            <MoneyText amount={expenses.data.filteredTotal} size="md" className="font-semibold" />
          </p>
        ) : null}
      </div>

      {expenses.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : expenses.isError ? (
        <ErrorState
          error={expenses.error}
          title="We could not load your expenses"
          onRetry={() => void expenses.refetch()}
        />
      ) : expenses.data.items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses here yet"
          description={
            category === 'all'
              ? 'Log your first expense and it will show up here.'
              : `Nothing logged under ${categoryLabels[category as BudgetCategoryId]} this month.`
          }
          actionLabel="Add expense"
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <div
          className={cn('space-y-4 transition-opacity', expenses.isPlaceholderData && 'opacity-60')}
        >
          <ExpenseList
            expenses={expenses.data.items}
            onDelete={setPendingDelete}
            deletingId={deleteExpense.isPending ? pendingDelete?.id : null}
          />
          <Pagination
            page={expenses.data.meta.page}
            pageSize={expenses.data.meta.pageSize}
            total={expenses.data.meta.total}
            onPageChange={(next) => {
              const nextParams = new URLSearchParams(params)
              nextParams.set('page', String(next))
              setParams(nextParams, { replace: true })
            }}
          />
        </div>
      )}

      <AddExpenseDialog open={addOpen} onOpenChange={setAddOpen} />

      <Modal
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this expense?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be removed and your budget will update.`
            : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPendingDelete(null)}>
            Keep it
          </Button>
          <Button
            variant="destructive"
            disabled={deleteExpense.isPending}
            onClick={() => {
              if (!pendingDelete) return
              deleteExpense.mutate(pendingDelete.id, {
                onSuccess: () => setPendingDelete(null),
              })
            }}
          >
            {deleteExpense.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
