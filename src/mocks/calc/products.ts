import type { PriceVerdict } from '@/types/product'
import { formatINR } from '@/utils/currency'

/**
 * Price analysis behind the Shopping agent's "buy now or wait" call. Every function takes a
 * daily price series (oldest first, today last) and is pure, so the real backend can port it
 * one-for-one.
 */

/** A day counts as a sale day when the price sits at least 10% under the period average. */
export const SALE_DEPTH = 0.9
/** Within 3% of the period low counts as "at the low". */
export const AT_LOW_TOLERANCE = 1.03
/** 6% over the average counts as inflated by demand. */
export const INFLATED_THRESHOLD = 1.06

/** Retail-style price point ending in 9: 1,649 / 1,299 / 349. */
export function roundToPricePoint(value: number): number {
  return Math.max(9, Math.round(value / 10) * 10 - 1)
}

/** The cheapest available price on each day across the given platform series. */
export function dailyLowest(series: number[][]): number[] {
  if (series.length === 0) return []
  const length = Math.min(...series.map((s) => s.length))
  return Array.from({ length }, (_, day) => Math.min(...series.map((s) => s[day]!)))
}

export interface PriceStats {
  lowest: number
  highest: number
  average: number
  current: number
}

export function priceStats(series: number[]): PriceStats {
  if (series.length === 0) return { lowest: 0, highest: 0, average: 0, current: 0 }
  const total = series.reduce((sum, value) => sum + value, 0)
  return {
    lowest: Math.min(...series),
    highest: Math.max(...series),
    average: Math.round(total / series.length),
    current: series[series.length - 1]!,
  }
}

export interface SaleEvent {
  /** Days before today the sale started and ended; 0 means it is still running. */
  startDaysAgo: number
  endDaysAgo: number
  lowest: number
}

/** Groups consecutive sale days into events, oldest first. */
export function detectSaleEvents(series: number[], average: number): SaleEvent[] {
  const events: SaleEvent[] = []
  const last = series.length - 1
  let start: number | null = null
  let lowest = Number.POSITIVE_INFINITY

  series.forEach((price, day) => {
    const onSale = price <= average * SALE_DEPTH
    if (onSale) {
      if (start === null) {
        start = day
        lowest = price
      } else {
        lowest = Math.min(lowest, price)
      }
    }
    if ((!onSale || day === last) && start !== null) {
      const end = onSale ? day : day - 1
      events.push({ startDaysAgo: last - start, endDaysAgo: last - end, lowest })
      start = null
      lowest = Number.POSITIVE_INFINITY
    }
  })
  return events
}

/** Average gap between sale starts, in days; null with fewer than two sales to compare. */
export function saleCadenceDays(events: SaleEvent[]): number | null {
  if (events.length < 2) return null
  const gaps = events.slice(1).map((event, i) => events[i]!.startDaysAgo - event.startDaysAgo)
  return Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length)
}

export interface Verdict {
  verdict: PriceVerdict
  reason: string
}

/**
 * Buy now when today's price is at (or within 3% of) the period low, or when the price has
 * barely moved. Wait when it sits above a recurring sale price or is inflated by demand.
 */
export function buildVerdict(series: number[]): Verdict {
  const stats = priceStats(series)
  const { current, lowest, highest, average } = stats
  const events = detectSaleEvents(series, average)
  const ongoing = events.find((event) => event.endDaysAgo === 0) ?? null
  const finished = events.filter((event) => event.endDaysAgo > 0)

  if (current <= lowest * AT_LOW_TOLERANCE) {
    if (ongoing && finished.length > 0) {
      return {
        verdict: 'buyNow',
        reason: `The sale is on: ${formatINR(current)} matches the lowest price in 90 days, and sales like this end within a few days. Buy now.`,
      }
    }
    if (current === lowest) {
      const dropped = ongoing ? series[series.length - 1 - ongoing.startDaysAgo - 1] : undefined
      return {
        verdict: 'buyNow',
        reason: dropped
          ? `${formatINR(current)} is the lowest price in 90 days, down from ${formatINR(dropped)} — buy now.`
          : `${formatINR(current)} is the lowest price in 90 days — buy now.`,
      }
    }
    return {
      verdict: 'buyNow',
      reason: `${formatINR(current)} is within ${formatINR(current - lowest)} of the 90-day low, so waiting is unlikely to save much. Buy now.`,
    }
  }

  const lastSale = finished[finished.length - 1]
  if (lastSale && current > average * 0.97) {
    // A sale cut off by the start of the window has an unknown start, so it would skew the gap.
    const cadence = saleCadenceDays(
      finished.filter((event) => event.startDaysAgo < series.length - 1),
    )
    const weeks = cadence ? Math.max(1, Math.round(cadence / 7)) : null
    const nextInDays = cadence ? Math.max(1, cadence - lastSale.startDaysAgo) : null
    const rhythm = weeks
      ? `, and sales here come round about every ${weeks} weeks`
      : ''
    const next = nextInDays ? ` The next one is likely within ${nextInDays} days.` : ''
    return {
      verdict: 'wait',
      reason: `It dropped to ${formatINR(lastSale.lowest)} in the last sale ${lastSale.endDaysAgo} days ago${rhythm} — wait and save ${formatINR(current - lastSale.lowest)}.${next}`,
    }
  }

  if (current > average * INFLATED_THRESHOLD) {
    const percentAbove = Math.round(((current - average) / average) * 100)
    return {
      verdict: 'wait',
      reason: `${formatINR(current)} is ${percentAbove}% above the 90-day average of ${formatINR(average)} — seasonal demand has pushed it up, and prices usually settle within a few weeks. Wait.`,
    }
  }

  return {
    verdict: 'buyNow',
    reason: `The price has moved by only ${formatINR(highest - lowest)} in 90 days, so waiting is unlikely to save much — buy when you need it.`,
  }
}

/** One-paragraph text summary of a price chart, for screen readers and the chart caption. */
export function historySummary(
  days: number,
  stats: PriceStats,
  cheapestPlatform: string,
): string {
  return `Over the last ${days} days the best available price ranged from ${formatINR(stats.lowest)} to ${formatINR(stats.highest)}, averaging ${formatINR(stats.average)}. Today it is ${formatINR(stats.current)} on ${cheapestPlatform}.`
}

/** Share of MRP knocked off, as a whole percent. */
export function discountPercent(price: number, mrp: number): number {
  if (mrp <= 0 || price >= mrp) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}
