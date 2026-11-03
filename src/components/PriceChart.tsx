import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PriceHistory } from '@/types/product'
import { shoppingPlatforms } from '@/features/shop/utils/productCategories'
import { formatINR, formatINRCompact } from '@/utils/currency'
import { formatDate } from '@/utils/date'

/**
 * Colour follows the platform, never its position in this product's list, so ShopNest is the
 * same blue on every chart even when a product is not sold everywhere.
 */
function colorFor(platform: string): string {
  const slot = shoppingPlatforms.indexOf(platform as (typeof shoppingPlatforms)[number])
  return `var(--chart-${slot === -1 ? 1 : slot + 1})`
}

type Row = { date: string } & Record<string, number | string | null>

interface TooltipEntry {
  dataKey?: string | number
  value?: number | string | null
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
}) {
  if (!active || !payload?.length || label === undefined) return null
  const entries = payload
    .filter((entry): entry is { dataKey: string; value: number } => typeof entry.value === 'number')
    .sort((a, b) => a.value - b.value)

  return (
    <div className="min-w-44 rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-raised">
      <p className="mb-1.5 font-medium">{formatDate(String(label))}</p>
      <ul className="space-y-1">
        {entries.map((entry, index) => (
          <li key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ background: colorFor(entry.dataKey) }}
              />
              {entry.dataKey}
            </span>
            <span className="tabular font-semibold text-foreground">
              {formatINR(entry.value)}
              {index === 0 && entries.length > 1 ? (
                <span className="ml-1 text-xs font-normal text-success">lowest</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export interface PriceChartProps {
  history: PriceHistory
  className?: string
}

/** Daily price per platform over the chosen window, with a text summary and a table view. */
export function PriceChart({ history, className }: PriceChartProps) {
  const rows: Row[] = history.points.map((point) => {
    const row: Row = { date: point.date }
    for (const platform of history.platforms) row[platform] = point.prices[platform] ?? null
    return row
  })

  return (
    <figure className={className}>
      {/* Legend first, in text ink; the swatch carries identity, never the text colour. */}
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Platforms">
        {history.platforms.map((platform) => (
          <li key={platform} className="flex items-center gap-2 text-muted-foreground">
            <span
              aria-hidden="true"
              className="h-[3px] w-4 rounded-full"
              style={{ background: colorFor(platform) }}
            />
            {platform}
          </li>
        ))}
      </ul>

      <div className="h-64 w-full sm:h-72" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              minTickGap={36}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={(value: string) => formatDate(value)}
            />
            <YAxis
              width={52}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={(value: number) => formatINRCompact(value)}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            {history.platforms.map((platform) => (
              <Line
                key={platform}
                type="monotone"
                dataKey={platform}
                stroke={colorFor(platform)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <figcaption className="mt-3 text-sm text-muted-foreground">{history.summary}</figcaption>

      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
          View as table
        </summary>
        <div className="scrollbar-thin mt-3 max-h-72 overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">Daily price on each platform</caption>
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-left text-muted-foreground">
                <th scope="col" className="px-3 py-2 font-medium">
                  Date
                </th>
                {history.platforms.map((platform) => (
                  <th key={platform} scope="col" className="px-3 py-2 text-right font-medium">
                    {platform}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...history.points].reverse().map((point) => (
                <tr key={point.date} className="border-b border-border last:border-0">
                  <th scope="row" className="px-3 py-1.5 text-left font-normal">
                    {formatDate(point.date)}
                  </th>
                  {history.platforms.map((platform) => {
                    const price = point.prices[platform]
                    return (
                      <td key={platform} className="tabular px-3 py-1.5 text-right">
                        {price === undefined ? '—' : formatINR(price)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
