import { Link } from 'react-router-dom'
import { BellRing, CircleCheck } from 'lucide-react'
import { MoneyText } from '@/components/MoneyText'
import { usePriceAlerts } from '../hooks/useProducts'
import { cn } from '@/utils/cn'

/** The user's tracked products. Renders nothing until there is at least one alert. */
export function PriceAlertsStrip() {
  const alerts = usePriceAlerts()
  if (!alerts.data || alerts.data.length === 0) return null

  return (
    <section aria-labelledby="price-alerts-heading" className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 id="price-alerts-heading" className="flex items-center gap-2 text-sm font-semibold">
          <BellRing className="size-4 text-muted-foreground" aria-hidden="true" />
          Your price alerts
        </h2>
      </div>
      <ul className="scrollbar-thin flex gap-3 overflow-x-auto pb-1">
        {alerts.data.map((alert) => (
          <li key={alert.id} className="w-64 shrink-0">
            <Link
              to={`/shop/${alert.productId}`}
              className={cn(
                'block h-full space-y-2 rounded-xl border p-3 shadow-card transition-colors hover:border-primary/40',
                alert.triggered ? 'border-success/40 bg-success/5' : 'border-border bg-card',
              )}
            >
              <p className="line-clamp-1 text-sm font-medium">{alert.productName}</p>
              <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  Now <MoneyText amount={alert.currentPrice} size="sm" className="font-semibold" />
                </span>
                <span>
                  Target <MoneyText amount={alert.targetPrice} size="sm" tone="muted" />
                </span>
              </div>
              {alert.triggered ? (
                <p className="flex items-center gap-1 text-xs font-medium text-success">
                  <CircleCheck className="size-3.5" aria-hidden="true" />
                  Target reached — good time to buy
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  <MoneyText amount={alert.gapToTarget} size="sm" className="text-xs font-medium" /> to
                  go
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
