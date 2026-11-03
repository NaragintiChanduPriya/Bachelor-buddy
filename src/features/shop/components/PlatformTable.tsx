import { Store, Truck } from 'lucide-react'
import type { PlatformPrice } from '@/types/product'
import { Badge } from '@/components/ui/badge'
import { MoneyText } from '@/components/MoneyText'
import { SponsoredTag } from '@/components/SponsoredTag'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/cn'

function delivery(row: PlatformPrice): string {
  if (!row.inStock) return 'Out of stock'
  if (row.deliveryDays <= 1) return `Tomorrow, ${formatDate(row.deliveryBy)}`
  return `${row.deliveryDays} days · by ${formatDate(row.deliveryBy)}`
}

/**
 * Every platform's price, cheapest first as the server ranks them. Sponsored rows are labelled
 * and keep their honest position.
 */
export function PlatformTable({ platforms, productName }: { platforms: PlatformPrice[]; productName: string }) {
  return (
    <>
      {/* Desktop and tablet: a real table. */}
      <div className="hidden overflow-hidden rounded-lg border border-border sm:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Price of {productName} on each platform</caption>
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Platform
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                Price
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                MRP
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Delivery
              </th>
            </tr>
          </thead>
          <tbody>
            {platforms.map((row) => (
              <tr
                key={row.platform}
                className={cn(
                  'border-t border-border',
                  row.isCheapest && 'bg-success/5',
                  !row.inStock && 'text-muted-foreground',
                )}
              >
                <th scope="row" className="px-4 py-3 text-left font-medium">
                  <span className="flex flex-wrap items-center gap-2">
                    <Store className="size-4 text-muted-foreground" aria-hidden="true" />
                    {row.platform}
                    {row.isCheapest ? <Badge variant="success">Cheapest</Badge> : null}
                    {row.sponsored ? <SponsoredTag /> : null}
                  </span>
                </th>
                <td className="px-4 py-3 text-right">
                  <MoneyText
                    amount={row.price}
                    size="md"
                    tone={row.isCheapest ? 'success' : 'default'}
                    className="font-semibold"
                  />
                  {row.discountPercent > 0 ? (
                    <span className="block text-xs text-muted-foreground">
                      {row.discountPercent}% off
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground line-through">
                  <MoneyText amount={row.mrp} size="sm" tone="muted" />
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <Truck className="size-4 text-muted-foreground" aria-hidden="true" />
                    {delivery(row)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: stacked cards carrying the same information. */}
      <ul className="space-y-2 sm:hidden">
        {platforms.map((row) => (
          <li
            key={row.platform}
            className={cn(
              'space-y-1.5 rounded-lg border p-3',
              row.isCheapest ? 'border-success/40 bg-success/5' : 'border-border',
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{row.platform}</span>
              {row.isCheapest ? <Badge variant="success">Cheapest</Badge> : null}
              {row.sponsored ? <SponsoredTag /> : null}
              <MoneyText
                amount={row.price}
                size="md"
                tone={row.isCheapest ? 'success' : 'default'}
                className="ml-auto font-semibold"
              />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="size-3.5" aria-hidden="true" />
              {delivery(row)}
              <span aria-hidden="true">·</span>
              MRP <MoneyText amount={row.mrp} size="sm" tone="muted" className="text-xs line-through" />
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}
