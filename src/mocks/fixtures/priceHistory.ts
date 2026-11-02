import { roundToPricePoint } from '../calc/products'
import { createRandom, hashSeed, randomFloat } from '../random'
import type { PricePattern } from './productSeeds'

/** Every product carries 90 days of daily prices, oldest first, ending today. */
export const HISTORY_DAYS = 90

/** A sale takes 22% off on the primary platform; the others follow at half the depth. */
const SALE_RATIO = 0.78
/** A one-off price cut, when the seed does not give an exact low. */
const DROP_RATIO = 0.8
/** Seasonal demand lifts prices up to 16% over the last 24 days. */
const SPIKE_PEAK = 0.16
const SPIKE_DAYS = 24
/** Prices change about once a week, by up to 1.5%. */
const WEEKLY_NOISE = 0.015

/** Sale timing: a sale of `length` days every `cycle` days, shifted by `offset`. */
export interface SaleSchedule {
  cycle: number
  length: number
  offset: number
}

export interface SeriesInput {
  /** Seed string for this product + platform's weekly noise. */
  noiseKey: string
  pattern: PricePattern
  isPrimary: boolean
  /** Normal price on this platform. */
  level: number
  /** Normal price on the primary platform, used to size this platform's sale. */
  primaryLevel: number
  /** Exact primary-platform low, if the seed fixes one. */
  primaryLow: number | undefined
  schedule: SaleSchedule
  dropDaysAgo: number
}

function onSale(daysAgo: number, schedule: SaleSchedule): boolean {
  return (daysAgo + schedule.offset) % schedule.cycle < schedule.length
}

/** The low this platform sells at during a sale or after a drop. */
function lowFor(input: SeriesInput, fallbackRatio: number): number {
  const primaryLow = input.primaryLow ?? roundToPricePoint(input.primaryLevel * fallbackRatio)
  if (input.isPrimary) return primaryLow
  const ratio = primaryLow / input.primaryLevel
  return roundToPricePoint(input.level * (1 - (1 - ratio) / 2))
}

/**
 * One platform's daily prices. Sale and drop prices are exact so the verdict can quote them;
 * ordinary days carry a small weekly wobble from the seeded generator, so the chart looks the
 * same on every reload.
 */
export function generateSeries(input: SeriesInput): number[] {
  const rand = createRandom(hashSeed(input.noiseKey))
  const weeks = Math.ceil(HISTORY_DAYS / 7)
  const noise = Array.from({ length: weeks }, () =>
    randomFloat(rand, -WEEKLY_NOISE, WEEKLY_NOISE, 3),
  )
  const wobble = (daysAgo: number) =>
    roundToPricePoint(input.level * (1 + noise[Math.floor(daysAgo / 7)]!))

  const saleLow = lowFor(input, SALE_RATIO)
  const dropLow = lowFor(input, DROP_RATIO)

  return Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const daysAgo = HISTORY_DAYS - 1 - index

    switch (input.pattern) {
      case 'steady':
        return wobble(daysAgo)

      case 'inSale':
      case 'afterSale':
        return onSale(daysAgo, input.schedule) ? saleLow : wobble(daysAgo)

      case 'festivalSpike': {
        if (daysAgo >= SPIKE_DAYS) return wobble(daysAgo)
        const lift = (SPIKE_PEAK * (SPIKE_DAYS - daysAgo)) / SPIKE_DAYS
        return roundToPricePoint(input.level * (1 + lift))
      }

      case 'recentDrop':
        // Only the primary platform cut its price; it held flat before the cut, so the
        // "fell from" figure is exact.
        if (!input.isPrimary) return wobble(daysAgo)
        return daysAgo <= input.dropDaysAgo ? dropLow : input.level
    }
  })
}

/**
 * Sale timing per pattern. A running sale ("inSale") includes today; a finished one
 * ("afterSale") ended a couple of weeks ago, with the next one about a week out.
 */
export function scheduleFor(pattern: PricePattern, offset: number): SaleSchedule {
  if (pattern === 'inSale') return { cycle: 30, length: 4, offset: 1 }
  return { cycle: 28, length: 5, offset }
}
