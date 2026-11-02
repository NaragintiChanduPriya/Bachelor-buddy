import type { DeliveryComparison, DeliveryFeeBreakdown, FoodListing } from '@/types/food'

/**
 * Invented delivery platforms. Each marks the item price up and adds its own fees — which is
 * exactly the gap the Food agent exists to point out.
 */
interface PlatformConfig {
  name: string
  /** Platforms list a higher menu price than the restaurant charges in person. */
  itemMarkupPercent: number
  baseDeliveryFee: number
  /** Added per km beyond the first two. */
  perKmFee: number
  platformFee: number
  packagingFee: number
}

const platforms: PlatformConfig[] = [
  {
    name: 'FeastDrop',
    itemMarkupPercent: 18,
    baseDeliveryFee: 35,
    perKmFee: 8,
    platformFee: 12,
    packagingFee: 20,
  },
  {
    name: 'QuickBite',
    itemMarkupPercent: 22,
    baseDeliveryFee: 29,
    perKmFee: 10,
    platformFee: 15,
    packagingFee: 25,
  },
  {
    name: 'DabbaRun',
    itemMarkupPercent: 12,
    baseDeliveryFee: 45,
    perKmFee: 6,
    platformFee: 8,
    packagingFee: 15,
  },
]

/** GST on prepared food, applied to the marked-up item price plus fees. */
const GST_PERCENT = 5

/**
 * Builds one platform's full bill. Every intermediate value is rounded to whole rupees so the
 * parts always add up to the total exactly — a bill that does not reconcile reads as a bug.
 */
function breakdownFor(
  platform: PlatformConfig,
  dineInPrice: number,
  distanceKm: number,
): DeliveryFeeBreakdown {
  const itemPrice = Math.round(dineInPrice * (1 + platform.itemMarkupPercent / 100))
  const extraKm = Math.max(0, distanceKm - 2)
  const deliveryFee = Math.round(platform.baseDeliveryFee + extraKm * platform.perKmFee)
  const taxes = Math.round(((itemPrice + platform.packagingFee) * GST_PERCENT) / 100)

  const total =
    itemPrice + deliveryFee + platform.platformFee + platform.packagingFee + taxes

  return {
    platform: platform.name,
    itemPrice,
    deliveryFee,
    platformFee: platform.platformFee,
    packagingFee: platform.packagingFee,
    taxes,
    total,
  }
}

/** How many times a month a weekday lunch would be ordered, used for the "if you switched" line. */
const WEEKDAY_MEALS_PER_MONTH = 22

/**
 * Compares eating at the place against having the same dish delivered. Returns every platform
 * so the UI can show the full fee breakdown, with the cheapest highlighted.
 */
export function compareDelivery(
  listing: FoodListing,
  dish: string | undefined,
  distanceKm: number,
): DeliveryComparison {
  // Default to the most popular main, which is what a user would actually order.
  const chosen =
    (dish ? listing.menu.find((item) => item.name.toLowerCase() === dish.toLowerCase()) : null) ??
    listing.menu.find((item) => item.popular && !item.name.startsWith('Monthly')) ??
    listing.menu[0]!

  const dineInPrice = chosen.price
  const options = platforms
    .map((platform) => breakdownFor(platform, dineInPrice, distanceKm))
    .sort((a, b) => a.total - b.total)

  const cheapest = options[0]!
  const amountSaved = cheapest.total - dineInPrice

  return {
    listingId: listing.id,
    listingName: listing.name,
    dish: chosen.name,
    dineInPrice,
    cheapestDelivery: cheapest,
    deliveryOptions: options,
    amountSaved,
    percentSaved: cheapest.total > 0 ? Math.round((amountSaved / cheapest.total) * 100) : 0,
    monthlySavingIfSwitched: amountSaved * WEEKDAY_MEALS_PER_MONTH,
  }
}

export const deliveryPlatformNames = platforms.map((p) => p.name)
