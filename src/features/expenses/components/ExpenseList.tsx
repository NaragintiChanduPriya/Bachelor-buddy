import { Trash2 } from 'lucide-react'
import type { Expense } from '@/types/expense'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoneyText } from '@/components/MoneyText'
import { formatFullDate, formatTime, toISTDateKey } from '@/utils/date'

export interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (expense: Expense) => void
  deletingId?: string | null
}

/** Groups by day. Renders as a table on desktop and a stacked list on mobile. */
export function ExpenseList({ expenses, onDelete, deletingId }: ExpenseListProps) {
  const groups = new Map<string, Expense[]>()
  for (const expense of expenses) {
    const key = toISTDateKey(expense.spentAt)
    const list = groups.get(key)
    if (list) list.push(expense)
    else groups.set(key, [expense])
  }

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([day, items]) => {
        const dayTotal = items.reduce((sum, e) => sum + e.amount, 0)
        return (
          <section key={day} aria-labelledby={`day-${day}`}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2 id={`day-${day}`} className="text-sm font-semibold">
                {formatFullDate(items[0]!.spentAt)}
              </h2>
              <MoneyText amount={dayTotal} size="sm" tone="muted" />
            </div>

            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {items.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center gap-3 p-3 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-sm font-medium">{expense.title}</p>
                    <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      <Badge variant="muted">{expense.categoryLabel}</Badge>
                      {expense.merchant ? <span>{expense.merchant}</span> : null}
                      <span>{formatTime(expense.spentAt)}</span>
                    </p>
                  </div>

                  <MoneyText amount={expense.amount} size="md" className="font-semibold" />

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${expense.title}`}
                    disabled={deletingId === expense.id}
                    onClick={() => onDelete(expense)}
                  >
                    <Trash2 aria-hidden="true" className="text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
