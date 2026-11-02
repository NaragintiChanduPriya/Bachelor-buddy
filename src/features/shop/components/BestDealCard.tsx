import { BadgePercent } from 'lucide-react'
import type { ProductDetail } from '@/types/product'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoneyText } from '@/components/MoneyText'
import { OfferChip } from '@/components/OfferChip'

/** The true price after the best offer the user can actually use. All values from the backend. */
export function BestDealCard({ product }: { product: ProductDetail }) {
  const offer = product.bestOffer

  return (
    <Card className="border-primary/25">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BadgePercent className="size-4 text-muted-foreground" aria-hidden="true" />
            Best price for you
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <MoneyText amount={product.finalPrice} size="xl" tone="primary" className="block" />
          <p className="mt-1 text-sm text-muted-foreground">
            on <span className="font-medium text-foreground">{product.bestDealPlatform}</span>
            {offer ? ' after your best offer' : ' — no card offer applies right now'}
          </p>
        </div>

        <dl className="space-y-2 rounded-lg border border-border p-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">MRP</dt>
            <dd>
              <MoneyText amount={product.mrp} size="sm" tone="muted" className="line-through" />
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Price on {product.bestDealPlatform}</dt>
            <dd>
              <MoneyText amount={product.bestDealBasePrice} size="sm" />
            </dd>
          </div>
          {offer ? (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Offer discount</dt>
              <dd>
                <MoneyText amount={-product.offerSaving} size="sm" tone="success" />
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3 border-t border-border pt-2 font-semibold">
            <dt>You pay</dt>
            <dd>
              <MoneyText amount={product.finalPrice} size="sm" className="font-semibold" />
            </dd>
          </div>
        </dl>

        {offer ? (
          <div className="space-y-1.5">
            <OfferChip offer={offer} />
            <p className="text-xs text-muted-foreground">{offer.description}</p>
          </div>
        ) : null}

        {product.totalSavingVsMrp > 0 ? (
          <p className="rounded-lg bg-success/10 px-3 py-2 text-sm">
            <MoneyText amount={product.totalSavingVsMrp} size="sm" tone="success" className="font-semibold" />{' '}
            less than MRP in total.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
