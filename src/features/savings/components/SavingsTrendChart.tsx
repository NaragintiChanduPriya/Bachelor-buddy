import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SavingsHistory } from '@/types/savings'
import { formatINR, formatINRCompact } from '@/utils/currency'
import { formatMonthShort } from '@/utils/date'

interface TooltipPayload {
  payload?: { monthLabel: string; saved: number; goal: number }
}

function TrendTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-raised">
      <p className="font-medium">{point.monthLabel}</p>
      <p className="tabular text-muted-foreground">
        Saved <span className="font-semibold text-foreground">{formatINR(point.saved)}</span> of{' '}
        {formatINR(point.goal)}
      </p>
    </div>
  )
}

/**
 * One series (saved per month) against a dashed goal line. A single series needs no legend:
 * the card title names it, and the goal line is labelled directly.
 */
export function SavingsTrendChart({ history }: { history: SavingsHistory }) {
  const data = history.months.map((point) => ({ ...point, short: formatMonthShort(point.month) }))
  const goal = history.months[history.months.length - 1]?.goal ?? 0

  return (
    <figure className="space-y-3">
      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="short"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              width={48}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={(value: number) => formatINRCompact(value)}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
              content={<TrendTooltip />}
            />
            {goal > 0 ? (
              <ReferenceLine
                y={goal}
                stroke="var(--muted-foreground)"
                strokeDasharray="5 4"
                label={{
                  value: `Goal ${formatINRCompact(goal)}`,
                  position: 'insideTopRight',
                  fill: 'var(--muted-foreground)',
                  fontSize: 12,
                }}
              />
            ) : null}
            <Bar dataKey="saved" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <figcaption className="text-sm text-muted-foreground">{history.summary}</figcaption>

      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
          View as table
        </summary>
        <table className="mt-3 w-full text-sm">
          <caption className="sr-only">Money saved each month against the goal</caption>
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th scope="col" className="py-2 font-medium">
                Month
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Saved
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Goal
              </th>
            </tr>
          </thead>
          <tbody>
            {history.months.map((point) => (
              <tr key={point.month} className="border-b border-border last:border-0">
                <th scope="row" className="py-2 text-left font-normal">
                  {point.monthLabel}
                </th>
                <td className="tabular py-2 text-right">{formatINR(point.saved)}</td>
                <td className="tabular py-2 text-right text-muted-foreground">
                  {formatINR(point.goal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
