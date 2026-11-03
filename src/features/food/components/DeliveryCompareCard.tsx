import { ArrowRight, Bike, Store } from 'lucide-react'
import type { DeliveryComparison } from '@/types/food'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MoneyText } from '@/components/MoneyText'

/**
 * The comparison that makes the product's point: the same dish, eaten there versus delivered,
 * with every fee itemised. All the arithmetic is done by the backend.
 */
export function DeliveryCompareCard({ comparison }: { comparison: DeliveryComparison }) {
  const { cheapestDelivery: cheapest } = comparison

  const rows: Array<{ label: string; amount: number }> = [
    { label: 'Item price on the app', amount: cheapest.itemPrice },
    { label: 'Delivery fee', amount: cheapest.deliveryFee },
    { label: 'Platform fee', amount: cheapest.platformFee },
    { label: 'Packaging fee', amount: cheapest.packagingFee },
    { label: 'Taxes', amount: cheapest.taxes },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Delivery vs eating here</CardTitle>
        </div>
        <CardDescription>
          Comparing <strong className="text-foreground">{comparison.dish}</strong> at{' '}
          {comparison.listingName}.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 rounded-lg border border-success/40 bg-success/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Store className="size-4 text-success" aria-hidden="true" />
              Eat here
            </p>
            <MoneyText amount={comparison.dineInPrice} size="xl" tone="success" />
            <p className="text-xs text-muted-foreground">No fees, no taxes on top</p>
          </div>

          <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Bike className="size-4 text-muted-foreground" aria-hidden="true" />
              Delivered by {cheapest.platform}
            </p>
            <MoneyText amount={cheapest.total} size="xl" />
            <p className="text-xs text-muted-foreground">Cheapest of the delivery apps</p>
          </div>
        </div>

        <div className="rounded-lg border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">
              How the {cheapest.platform} delivery bill of{' '}
              {cheapest.total} rupees is made up
            </caption>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <th scope="row" className="px-4 py-2 text-left font-normal text-muted-foreground">
                    {row.label}
                  </th>
                  <td className="px-4 py-2 text-right">
                    <MoneyText amount={row.amount} size="sm" />
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/40">
                <th scope="row" className="px-4 py-2 text-left font-semibold">
                  Delivery total
                </th>
                <td className="px-4 py-2 text-right font-semibold">
                  <MoneyText amount={cheapest.total} size="sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-primary/10 p-4">
          <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm">
            Eating here saves{' '}
            <MoneyText amount={comparison.amountSaved} size="sm" tone="primary" /> on this meal —{' '}
            <strong>{comparison.percentSaved}% less</strong> than ordering in. Over a month of
            weekday lunches that is{' '}
            <MoneyText amount={comparison.monthlySavingIfSwitched} size="sm" tone="primary" />.
          </p>
        </div>

        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            Compare all delivery apps
          </summary>
          <ul className="mt-3 space-y-2">
            {comparison.deliveryOptions.map((option, index) => (
              <li
                key={option.platform}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  {option.platform}
                  {index === 0 ? <Badge variant="success">Cheapest</Badge> : null}
                </span>
                <MoneyText amount={option.total} size="sm" />
              </li>
            ))}
          </ul>
        </details>
      </CardContent>
    </Card>
  )
}
