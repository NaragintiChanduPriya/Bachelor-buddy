import type { OfferPlatformCategory } from '@/types/offer'

/** Filter chips, in a fixed order grouped by what the platform sells. Display data only. */
export const offerPlatforms = [
  'ShopNest',
  'TrendKart',
  'StyleBay',
  'FeastDrop',
  'QuickBite',
  'ZipCart',
] as const

export const platformCategoryLabels: Record<OfferPlatformCategory, string> = {
  shopping: 'Shopping',
  food: 'Food delivery',
  groceries: 'Groceries',
}
