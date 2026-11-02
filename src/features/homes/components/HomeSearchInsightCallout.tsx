import { Link } from 'react-router-dom'
import { PiggyBank, Scale } from 'lucide-react'
import type { HomeSearchInsight } from '@/types/home'
import { InsightCallout } from '@/components/InsightCallout'
import { MoneyText } from '@/components/MoneyText'
import { formatINR } from '@/utils/currency'

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

/**
 * The Home agent's read of the current search against the user's rent budget. Every number
 * here comes from the server's insight, computed across all matches rather than this page.
 */
export function HomeSearchInsightCallout({ insight }: { insight: HomeSearchInsight }) {
  if (insight.matchCount === 0 || insight.cheapestRent === null) return null

  const cheapestName = insight.cheapestHomeId ? (
    <Link
      to={`/homes/${insight.cheapestHomeId}`}
      className="font-medium text-foreground underline-offset-4 hover:underline"
    >
      {insight.cheapestHomeName}
    </Link>
  ) : (
    <span className="font-medium text-foreground">{insight.cheapestHomeName}</span>
  )

  if (insight.monthlySavingVsBudget > 0) {
    return (
      <InsightCallout
        tone="success"
        icon={PiggyBank}
        title={`The cheapest match saves you ${formatINR(insight.monthlySavingVsBudget)} a month`}
      >
        <p>
          {plural(insight.withinBudgetCount, 'place', 'places')} of {insight.matchCount} fit inside
          your <MoneyText amount={insight.rentBudget} size="sm" className="font-medium" /> rent
          budget. Moving to {cheapestName} at{' '}
          <MoneyText amount={insight.cheapestRent} size="sm" className="font-medium" /> would put{' '}
          <MoneyText
            amount={insight.yearlySavingVsBudget}
            size="sm"
            tone="success"
            className="font-semibold"
          />{' '}
          back in your pocket over a year.{' '}
          {insight.belowAverageCount > 0
            ? `${plural(insight.belowAverageCount, 'listing is', 'listings are')} priced below the area average.`
            : null}
        </p>
      </InsightCallout>
    )
  }

  return (
    <InsightCallout
      tone="warning"
      icon={Scale}
      title={`Nothing here beats your ${formatINR(insight.rentBudget)} rent budget`}
    >
      <p>
        The cheapest match, {cheapestName}, is{' '}
        <MoneyText amount={insight.cheapestRent} size="sm" className="font-medium" />. Try another
        area, or a PG or shared room, where rents run lower.
      </p>
    </InsightCallout>
  )
}
