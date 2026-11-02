import { useSearchParams } from 'react-router-dom'
import { LoaderCircle, Scale, Store } from 'lucide-react'
import type { GroceryComparison } from '@/types/grocery'
import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs } from '@/components/ui/tabs'
import { MoneyText } from '@/components/MoneyText'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { GroceryListEditor } from '@/features/groceries/components/GroceryListEditor'
import { StoreTotalsGrid } from '@/features/groceries/components/StoreTotalsGrid'
import { StoreComparisonTable } from '@/features/groceries/components/StoreComparisonTable'
import { useGroceryComparison, useGroceryList } from '@/features/groceries/hooks/useGroceries'
import { formatMonthLabel } from '@/utils/date'

type View = 'list' | 'compare'

/** The one summary on this page: what the list costs done right, and what that saves. */
function SummaryBand({ comparison }: { comparison: GroceryComparison }) {
  const quick = comparison.storeTotals.find((t) => t.store === 'quickCommerce')

  return (
    <Card>
      <CardContent className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr_1fr] md:divide-x md:divide-border">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Your list, bought the cheapest way</p>
          <MoneyText amount={comparison.mixedBasketTotal} size="xl" className="block" />
          <p className="text-sm text-muted-foreground">
            {comparison.itemCount} items for {formatMonthLabel(comparison.month)}
          </p>
        </div>
        <div className="space-y-1 md:pl-6">
          <p className="text-sm text-muted-foreground">One bulk order saves</p>
          <MoneyText amount={comparison.bulkSaving} size="lg" tone="success" className="block" />
          <p className="text-xs text-muted-foreground">vs several small orders</p>
        </div>
        <div className="space-y-1 md:pl-6">
          <p className="text-sm text-muted-foreground">Extra on {quick?.label ?? 'quick commerce'}</p>
          <MoneyText amount={comparison.quickCommerceExtra} size="lg" tone="warning" className="block" />
          <p className="text-xs text-muted-foreground">if you ordered it all there</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function GroceriesPage() {
  const [params, setParams] = useSearchParams()
  const view: View = params.get('view') === 'compare' ? 'compare' : 'list'
  const list = useGroceryList()
  const comparison = useGroceryComparison()

  // Render data whenever we have it, so a failed background refresh never hides good numbers.
  const compareData = comparison.data
  const refreshing = comparison.isFetching && Boolean(compareData)

  const setView = (next: View) => {
    const nextParams = new URLSearchParams(params)
    if (next === 'list') nextParams.delete('view')
    else nextParams.set('view', next)
    setParams(nextParams, { replace: true })
  }

  return (
    <div className="space-y-8">
      <SeoTitle
        title="Groceries"
        description="Your monthly grocery list, priced across quick commerce, supermarket, kirana and bulk."
      />
      <PageHeader
        title="Groceries"
        description="One monthly list, priced at four kinds of store, so you always know where to buy."
      />

      {compareData ? (
        <SummaryBand comparison={compareData} />
      ) : comparison.isError ? (
        <ErrorState
          error={comparison.error}
          title="We could not compare store prices"
          onRetry={() => void comparison.refetch()}
        />
      ) : (
        <Skeleton className="h-32 rounded-xl" />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Groceries view"
          items={[
            { value: 'list', label: 'Your list' },
            { value: 'compare', label: 'Compare stores' },
          ]}
          value={view}
          onChange={setView}
        />
        {refreshing ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
            Updating prices…
          </span>
        ) : null}
      </div>

      {view === 'list' ? (
        <div className="grid items-start gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {list.data ? (
              <GroceryListEditor list={list.data} />
            ) : list.isError ? (
              <ErrorState
                error={list.error}
                title="We could not load your list"
                onRetry={() => void list.refetch()}
              />
            ) : (
              <Skeleton className="h-[560px] rounded-xl" />
            )}
          </div>

          <section
            aria-labelledby="store-totals-heading"
            className="space-y-3 lg:sticky lg:top-24 lg:col-span-2"
          >
            <h2 id="store-totals-heading" className="flex items-center gap-2 font-semibold">
              <Store className="size-4 text-muted-foreground" aria-hidden="true" />
              Whole list, by store
            </h2>
            {compareData ? (
              compareData.itemCount === 0 ? (
                <EmptyState
                  icon={Store}
                  title="Nothing to compare yet"
                  description="Add items to your list to see what it costs at each store."
                />
              ) : (
                <StoreTotalsGrid
                  storeTotals={compareData.storeTotals}
                  itemCount={compareData.itemCount}
                />
              )
            ) : comparison.isError ? (
              <ErrorState error={comparison.error} onRetry={() => void comparison.refetch()} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="mb-4 text-sm text-muted-foreground">
              Line totals for the quantity on your list. The cheapest store for each item is
              marked.
            </p>
            {compareData ? (
              compareData.itemCount === 0 ? (
                <EmptyState
                  icon={Scale}
                  title="Your list is empty"
                  description="Once you add items, every store's price shows up here side by side."
                />
              ) : (
                <StoreComparisonTable comparison={compareData} />
              )
            ) : comparison.isError ? (
              <ErrorState
                error={comparison.error}
                title="We could not compare store prices"
                onRetry={() => void comparison.refetch()}
              />
            ) : (
              <div className="space-y-2" role="status" aria-label="Loading store comparison">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
