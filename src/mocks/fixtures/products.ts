import type { ProductCategory } from '@/types/product'
import type { PriceAlertRecord } from '../db'
import { daysAgo, daysUntilNextFriday } from '../clock'
import { roundToPricePoint } from '../calc/products'
import { randomFloat, randomInt, seededFrom } from '../random'
import { toISTDateKey } from '@/utils/date'
import { HISTORY_DAYS, generateSeries, scheduleFor } from './priceHistory'
import { productSeeds, type ProductSeed, type ShoppingPlatform } from './productSeeds'

const allPlatforms: ShoppingPlatform[] = ['ShopNest', 'TrendKart', 'StyleBay']

/** Base thumbnail hue per category, so a category's gradients read as a family. */
const categoryHue: Record<ProductCategory, number> = {
  shirts: 205,
  jeans: 235,
  formalShoes: 25,
  backpacks: 160,
  earphones: 285,
  watches: 50,
  raincoats: 190,
  helmets: 350,
}

export interface ProductPlatformRecord {
  platform: ShoppingPlatform
  inStock: boolean
  deliveryDays: number
  sponsored: boolean
  /** Daily prices, oldest first; the last value is today's price. */
  series: number[]
}

export interface ProductRecord extends Omit<ProductSeed, 'platforms'> {
  rating: number
  reviewCount: number
  thumbnailSeed: number
  /** YYYY-MM-DD (IST) for each history point, oldest first. */
  dates: string[]
  platforms: ProductPlatformRecord[]
}

function buildRecord(seed: ProductSeed, dates: string[]): ProductRecord {
  const rand = seededFrom(seed.id)
  const listed = seed.platforms ?? [
    seed.primary,
    ...allPlatforms.filter((p) => p !== seed.primary),
  ]
  const schedule = scheduleFor(seed.pattern, randomInt(rand, 8, 16))
  const dropDaysAgo = randomInt(rand, 0, 2)
  // Whatever the month, the fast-delivery shoes arrive before the coming Friday.
  const fastDays = Math.min(2, daysUntilNextFriday())

  const platforms = listed.map((platform): ProductPlatformRecord => {
    const isPrimary = platform === seed.primary
    // Other platforms list the same item a little dearer, unless the seed fixes their price.
    const level = isPrimary
      ? seed.basePrice
      : (seed.platformPrices?.[platform] ??
        roundToPricePoint(seed.basePrice * randomFloat(rand, 1.03, 1.12, 2)))

    return {
      platform,
      inStock: seed.outOfStockOn !== platform,
      deliveryDays: isPrimary && seed.fastDelivery ? fastDays : randomInt(rand, 2, 6),
      sponsored: seed.sponsoredOn === platform,
      series: generateSeries({
        noiseKey: `${seed.id}:${platform}`,
        pattern: seed.pattern,
        isPrimary,
        level,
        primaryLevel: seed.basePrice,
        primaryLow: seed.lowPrice,
        schedule,
        dropDaysAgo,
      }),
    }
  })

  const { platforms: _listed, ...rest } = seed
  return {
    ...rest,
    rating: randomFloat(rand, 3.7, 4.7, 1),
    reviewCount: randomInt(rand, 64, 5400),
    thumbnailSeed: categoryHue[seed.category] + randomInt(rand, 0, 28),
    dates,
    platforms,
  }
}

let cache: ProductRecord[] | null = null

/**
 * The product catalog with full price history. Built once on first use: prices are static for
 * the session, so only alerts (in the mock db) ever change.
 */
export function productRecords(): ProductRecord[] {
  if (!cache) {
    const dates = Array.from({ length: HISTORY_DAYS }, (_, index) =>
      toISTDateKey(daysAgo(HISTORY_DAYS - 1 - index)),
    )
    cache = productSeeds.map((seed) => buildRecord(seed, dates))
  }
  return cache
}

export function findProductRecord(id: string): ProductRecord | undefined {
  return productRecords().find((p) => p.id === id)
}

/**
 * Arjun is tracking the Oxford shoes (the alert has fired — see notif_003) and a pair of ANC
 * earbuds he is waiting to see on sale.
 */
export const defaultPriceAlerts: PriceAlertRecord[] = [
  { id: 'alert_001', productId: 'prod_009', targetPrice: 1799, createdAt: daysAgo(10, 21, 15) },
  { id: 'alert_002', productId: 'prod_018', targetPrice: 1599, createdAt: daysAgo(5, 22, 40) },
]
