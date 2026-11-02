import type {
  PlatformPrice,
  PriceAlert,
  PriceHistory,
  ProductDetail,
  ProductFilters,
  ProductSummary,
} from '@/types/product'
import type { OfferApplication } from '@/types/offer'
import { productCategoryLabels } from '@/features/shop/utils/productCategories'
import { db, type PriceAlertRecord } from '../db'
import { daysAhead } from '../clock'
import { bestOfferFor } from '../calc/offers'
import {
  buildVerdict,
  dailyLowest,
  discountPercent,
  historySummary,
  priceStats,
} from '../calc/products'
import { HISTORY_DAYS } from '../fixtures/priceHistory'
import {
  findProductRecord,
  productRecords,
  type ProductPlatformRecord,
  type ProductRecord,
} from '../fixtures/products'
import { listOffers } from './offers'

function todayPrice(platform: ProductPlatformRecord): number {
  return platform.series[platform.series.length - 1]!
}

/** Platforms that can sell it today; if none can, fall back to all so prices still show. */
function available(record: ProductRecord): ProductPlatformRecord[] {
  const inStock = record.platforms.filter((p) => p.inStock)
  return inStock.length > 0 ? inStock : record.platforms
}

/** Cheapest first, then fastest — never by which platform pays for placement. */
function cheapestOf(platforms: ProductPlatformRecord[]): ProductPlatformRecord {
  return [...platforms].sort(
    (a, b) => todayPrice(a) - todayPrice(b) || a.deliveryDays - b.deliveryDays,
  )[0]!
}

export function toProductSummary(record: ProductRecord): ProductSummary {
  const selling = available(record)
  const prices = selling.map(todayPrice)
  const lowestPrice = Math.min(...prices)

  return {
    id: record.id,
    name: record.name,
    brand: record.brand,
    category: record.category,
    categoryLabel: productCategoryLabels[record.category],
    lowestPrice,
    highestPrice: Math.max(...prices),
    mrp: record.mrp,
    discountPercent: discountPercent(lowestPrice, record.mrp),
    rating: record.rating,
    reviewCount: record.reviewCount,
    cheapestPlatform: cheapestOf(selling).platform,
    fastestDeliveryDays: Math.min(...selling.map((p) => p.deliveryDays)),
    thumbnailSeed: record.thumbnailSeed,
    sponsored: record.sponsoredOn !== undefined,
  }
}

/**
 * Search shared by GET /products/search and the chat agent: filtered and honestly sorted,
 * unpaginated. Sponsored products keep whatever position the sort gives them.
 */
export function searchProducts(filters: ProductFilters): ProductSummary[] {
  const tokens = (filters.q ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  let items = productRecords().map(toProductSummary)

  if (tokens.length > 0) {
    items = items.filter((item) => {
      const haystack = `${item.name} ${item.brand} ${item.categoryLabel}`.toLowerCase()
      return tokens.every((token) => haystack.includes(token))
    })
  }
  if (filters.category && filters.category !== 'all') {
    items = items.filter((item) => item.category === filters.category)
  }
  if (filters.maxPrice !== undefined) {
    const max = filters.maxPrice
    items = items.filter((item) => item.lowestPrice <= max)
  }

  switch (filters.sort ?? 'price') {
    case 'price':
      items.sort((a, b) => a.lowestPrice - b.lowestPrice || b.rating - a.rating)
      break
    case 'rating':
      items.sort((a, b) => b.rating - a.rating || a.lowestPrice - b.lowestPrice)
      break
    case 'discount':
      items.sort((a, b) => b.discountPercent - a.discountPercent || a.lowestPrice - b.lowestPrice)
      break
  }
  return items
}

/** The platform where the best usable offer leaves the lowest final price. */
function bestDeal(selling: ProductPlatformRecord[]) {
  const offers = listOffers({ eligibleOnly: true })
  let best: { platform: string; basePrice: number; application: OfferApplication | null } | null =
    null

  for (const platform of selling) {
    const basePrice = todayPrice(platform)
    const application = bestOfferFor(basePrice, platform.platform, offers)
    const finalPrice = application?.finalPrice ?? basePrice
    const bestFinal = best ? (best.application?.finalPrice ?? best.basePrice) : Infinity
    if (finalPrice < bestFinal || (finalPrice === bestFinal && best && basePrice < best.basePrice)) {
      best = { platform: platform.platform, basePrice, application }
    }
  }
  return best!
}

export function getProductDetail(id: string): ProductDetail | null {
  const record = findProductRecord(id)
  if (!record) return null

  const summary = toProductSummary(record)
  const selling = available(record)

  const platforms: PlatformPrice[] = record.platforms
    .map((p) => {
      const price = todayPrice(p)
      return {
        platform: p.platform,
        price,
        mrp: record.mrp,
        discountPercent: discountPercent(price, record.mrp),
        inStock: p.inStock,
        deliveryDays: p.deliveryDays,
        deliveryBy: daysAhead(p.deliveryDays, 20, 0),
        sponsored: p.sponsored,
        isCheapest: p.inStock && p.platform === summary.cheapestPlatform,
      }
    })
    // In stock first, then cheapest. A sponsored listing is labelled, never promoted.
    .sort((a, b) => Number(b.inStock) - Number(a.inStock) || a.price - b.price)

  const series = dailyLowest(selling.map((p) => p.series))
  const stats = priceStats(series)
  const { verdict, reason } = buildVerdict(series)
  const deal = bestDeal(selling)
  const finalPrice = deal.application?.finalPrice ?? deal.basePrice
  const alert = db.priceAlerts.find((a) => a.productId === id) ?? null

  return {
    ...summary,
    description: record.description,
    highlights: record.highlights,
    platforms,
    verdict,
    verdictReason: reason,
    lowest90Day: stats.lowest,
    highest90Day: stats.highest,
    average90Day: stats.average,
    aboveLowest90Day: stats.current - stats.lowest,
    bestOffer: deal.application?.offer ?? null,
    bestDealPlatform: deal.platform,
    bestDealBasePrice: deal.basePrice,
    finalPrice,
    offerSaving: deal.application?.discount ?? 0,
    totalSavingVsMrp: Math.max(0, record.mrp - finalPrice),
    hasAlert: alert !== null,
    alertTargetPrice: alert?.targetPrice ?? null,
  }
}

/** The last `days` of daily prices per platform, with stats over the best in-stock price. */
export function getPriceHistory(id: string, days: number): PriceHistory | null {
  const record = findProductRecord(id)
  if (!record) return null

  const window = Math.min(Math.max(1, days), HISTORY_DAYS)
  const start = HISTORY_DAYS - window
  const points = record.dates.slice(start).map((date, i) => ({
    date,
    prices: Object.fromEntries(record.platforms.map((p) => [p.platform, p.series[start + i]!])),
  }))

  const selling = available(record)
  const stats = priceStats(dailyLowest(selling.map((p) => p.series.slice(start))))
  const cheapest = cheapestOf(selling).platform

  return {
    productId: id,
    days: window,
    platforms: record.platforms.map((p) => p.platform),
    points,
    lowest: stats.lowest,
    highest: stats.highest,
    average: stats.average,
    currentLowest: stats.current,
    summary: historySummary(window, stats, cheapest),
  }
}

/** A stored alert with its live price and whether it has fired. */
export function toPriceAlert(alert: PriceAlertRecord): PriceAlert | null {
  const record = findProductRecord(alert.productId)
  if (!record) return null
  const currentPrice = toProductSummary(record).lowestPrice
  return {
    id: alert.id,
    productId: alert.productId,
    productName: `${record.brand} ${record.name}`,
    targetPrice: alert.targetPrice,
    currentPrice,
    gapToTarget: Math.max(0, currentPrice - alert.targetPrice),
    triggered: currentPrice <= alert.targetPrice,
    createdAt: alert.createdAt,
  }
}

export function listPriceAlerts(): PriceAlert[] {
  return db.priceAlerts
    .map(toPriceAlert)
    .filter((alert): alert is PriceAlert => alert !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
