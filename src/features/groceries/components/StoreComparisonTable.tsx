import { CircleCheck } from 'lucide-react'
import type { GroceryComparison, StoreType } from '@/types/grocery'
import { Badge } from '@/components/ui/badge'
import { MoneyText } from '@/components/MoneyText'
import { storeKindMeta } from '../utils/storeMeta'
import { cn } from '@/utils/cn'

export interface StoreComparisonTableProps {
  comparison: GroceryComparison
}

function CheapestMark() {
  return (
    <Badge variant="success" className="px-1.5 py-0 text-[10px]">
      <CircleCheck className="size-2.5" aria-hidden="true" />
      Cheapest
    </Badge>
  )
}

/**
 * Every line on the list priced at every store type. A table on desktop; on phones each item
 * becomes a small card so nothing scrolls sideways.
 */
export function StoreComparisonTable({ comparison }: StoreComparisonTableProps) {
  const stores = comparison.storeTotals
  const bestStore: StoreType = comparison.cheapestStore

  return (
    <>
      {/* Desktop and tablet */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full min-w-[720px] text-sm">
          <caption className="sr-only">
            What each item on your list costs at each store type, for the quantity on your list.
            The cheapest store for each item is marked Cheapest, and the totals row shows the
            whole list at each store.
          </caption>
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Item
              </th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">
                Qty
              </th>
              {stores.map((store) => (
                <th
                  key={store.store}
                  scope="col"
                  className={cn(
                    'px-3 py-3 text-right align-bottom font-semibold',
                    store.store === bestStore && 'bg-success/10',
                  )}
                >
                  <span className="block">{store.label}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {storeKindMeta[store.store].kind}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => (
              <tr key={row.itemId} className="border-b border-border last:border-0 hover:bg-muted/30">
                <th scope="row" className="px-4 py-2.5 text-left font-normal">
                  <span className="block font-medium">{row.name}</span>
                  <span className="block text-xs text-muted-foreground">{row.unit}</span>
                </th>
                <td className="px-3 py-2.5 text-right tabular text-muted-foreground">
                  ×{row.quantity}
                </td>
                {stores.map((store) => {
                  const isCheapest = row.cheapestStore === store.store
                  const bulk = store.store === 'onlineBulk' && row.bulkApplied
                  return (
                    <td
                      key={store.store}
                      className={cn(
                        'px-3 py-2.5 text-right',
                        store.store === bestStore && 'bg-success/5',
                        isCheapest && 'bg-success/10',
                      )}
                    >
                      <span className="flex flex-col items-end gap-1">
                        <MoneyText
                          amount={row.lineTotals[store.store]}
                          size="sm"
                          tone={isCheapest ? 'success' : 'default'}
                          className={cn(isCheapest && 'font-semibold')}
                        />
                        {isCheapest ? <CheapestMark /> : null}
                        {bulk ? (
                          <span className="text-[10px] font-medium text-muted-foreground">
                            Bulk pack
                          </span>
                        ) : null}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-border bg-muted/40">
            <tr>
              <th scope="row" colSpan={2} className="px-4 py-3 text-left font-semibold">
                Whole list
              </th>
              {stores.map((store) => (
                <td
                  key={store.store}
                  className={cn('px-3 py-3 text-right', store.isCheapest && 'bg-success/10')}
                >
                  <span className="flex flex-col items-end gap-0.5">
                    <MoneyText
                      amount={store.total}
                      size="md"
                      tone={store.isCheapest ? 'success' : 'default'}
                      className="font-semibold"
                    />
                    <span className="text-xs text-muted-foreground">
                      {store.isCheapest ? (
                        'Best single store'
                      ) : (
                        <>
                          +<MoneyText amount={store.differenceFromCheapest} size="sm" tone="muted" />
                        </>
                      )}
                    </span>
                  </span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Phones */}
      <ul className="space-y-3 md:hidden" aria-label="Price of each item by store">
        {comparison.rows.map((row) => (
          <li key={row.itemId} className="rounded-xl border border-border bg-card p-3">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <p className="font-medium">{row.name}</p>
              <p className="shrink-0 text-xs text-muted-foreground">
                {row.unit} × <span className="tabular">{row.quantity}</span>
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-2">
              {stores.map((store) => {
                const isCheapest = row.cheapestStore === store.store
                return (
                  <div
                    key={store.store}
                    className={cn(
                      'rounded-lg border px-2.5 py-2',
                      isCheapest ? 'border-success/40 bg-success/10' : 'border-border',
                    )}
                  >
                    <dt className="truncate text-[11px] text-muted-foreground">{store.label}</dt>
                    <dd className="flex flex-wrap items-center justify-between gap-1">
                      <MoneyText
                        amount={row.lineTotals[store.store]}
                        size="sm"
                        tone={isCheapest ? 'success' : 'default'}
                        className={cn(isCheapest && 'font-semibold')}
                      />
                      {isCheapest ? <CheapestMark /> : null}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </li>
        ))}
        <li className="rounded-xl border-2 border-border bg-muted/40 p-3">
          <p className="mb-2 font-semibold">Whole list</p>
          <dl className="grid grid-cols-2 gap-2">
            {stores.map((store) => (
              <div
                key={store.store}
                className={cn(
                  'rounded-lg border bg-card px-2.5 py-2',
                  store.isCheapest ? 'border-success/40' : 'border-border',
                )}
              >
                <dt className="truncate text-[11px] text-muted-foreground">{store.label}</dt>
                <dd>
                  <MoneyText
                    amount={store.total}
                    size="sm"
                    tone={store.isCheapest ? 'success' : 'default'}
                    className="font-semibold"
                  />
                </dd>
              </div>
            ))}
          </dl>
        </li>
      </ul>
    </>
  )
}
