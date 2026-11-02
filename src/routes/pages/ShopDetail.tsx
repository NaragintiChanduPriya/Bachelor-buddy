import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, LineChart, ShoppingCart, Star, Store } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs } from '@/components/ui/tabs'
import { MoneyText } from '@/components/MoneyText'
import { ErrorState } from '@/components/ErrorState'
import { SponsoredTag } from '@/components/SponsoredTag'
import { InsightCallout } from '@/components/InsightCallout'
import { PriceChart } from '@/components/PriceChart'
import { PlatformTable } from '@/features/shop/components/PlatformTable'
import { BestDealCard } from '@/features/shop/components/BestDealCard'
import { PriceAlertCard } from '@/features/shop/components/PriceAlertCard'
import { usePriceHistory, useProduct } from '@/features/shop/hooks/useProducts'
import { productCategoryIcons } from '@/features/shop/utils/categoryIcons'
import { thumbnailStyle } from '@/utils/thumbnail'

type Window = '30' | '60' | '90'

export default function ShopDetailPage() {
  const { id = '' } = useParams()
  const [range, setRange] = useState<Window>('90')
  const product = useProduct(id)
  const history = usePriceHistory(id, Number(range))

  if (product.isPending) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading product">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  if (product.isError) {
    return (
      <div className="space-y-4">
        <SeoTitle title="Product not found" />
        <ErrorState
          error={product.error}
          title="We could not load this product"
          onRetry={() => void product.refetch()}
        />
        <Button asChild variant="outline">
          <Link to="/shop">Back to shop</Link>
        </Button>
      </div>
    )
  }

  const item = product.data
  const Icon = productCategoryIcons[item.category]
  const buyNow = item.verdict === 'buyNow'

  return (
    <div className="space-y-6">
      <SeoTitle title={item.name} description={item.description} />

      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/shop">
          <ArrowLeft aria-hidden="true" />
          All products
        </Link>
      </Button>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Hero */}
          <Card className="overflow-hidden">
            <div className="grid sm:grid-cols-[220px_1fr]">
              <div
                aria-hidden="true"
                style={thumbnailStyle(item.thumbnailSeed)}
                className="flex h-44 items-center justify-center text-white sm:h-full"
              >
                <Icon className="size-16 drop-shadow" strokeWidth={1.4} />
              </div>
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.brand} · {item.categoryLabel}
                  </p>
                  {item.sponsored ? <SponsoredTag /> : null}
                </div>
                <h1 className="text-2xl font-bold leading-tight tracking-tight">{item.name}</h1>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Star className="size-4 fill-current text-warning" aria-hidden="true" />
                  <span className="tabular font-medium text-foreground">{item.rating}</span>
                  <span className="tabular">({item.reviewCount.toLocaleString('en-IN')} reviews)</span>
                </p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-border pt-3">
                  <MoneyText amount={item.lowestPrice} size="xl" tone="primary" />
                  {item.mrp > item.lowestPrice ? (
                    <MoneyText amount={item.mrp} size="md" tone="muted" className="line-through" />
                  ) : null}
                  {item.discountPercent > 0 ? (
                    <span className="tabular rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                      {item.discountPercent}% off
                    </span>
                  ) : null}
                  <span className="text-sm text-muted-foreground">
                    lowest on {item.cheapestPlatform}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Verdict */}
          <InsightCallout
            tone={buyNow ? 'success' : 'warning'}
            icon={buyNow ? ShoppingCart : Clock}
            title={buyNow ? 'Buy now' : 'Wait for a better price'}
          >
            <p>{item.verdictReason}</p>
          </InsightCallout>

          {/* Platforms */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Store className="size-4 text-muted-foreground" aria-hidden="true" />
                Compare platforms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformTable platforms={item.platforms} productName={item.name} />
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LineChart className="size-4 text-muted-foreground" aria-hidden="true" />
                  Price history
                </CardTitle>
                <Tabs
                  label="History window"
                  items={[
                    { value: '30', label: '30 days' },
                    { value: '60', label: '60 days' },
                    { value: '90', label: '90 days' },
                  ]}
                  value={range}
                  onChange={setRange}
                  className="w-auto"
                />
              </div>
            </CardHeader>
            <CardContent>
              {history.isPending ? (
                <Skeleton className="h-72 rounded-lg" />
              ) : history.isError ? (
                <ErrorState
                  error={history.error}
                  title="We could not load the price history"
                  onRetry={() => void history.refetch()}
                />
              ) : (
                <PriceChart history={history.data} />
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <BestDealCard product={item} />
          <PriceAlertCard product={item} />
        </aside>
      </div>
    </div>
  )
}
