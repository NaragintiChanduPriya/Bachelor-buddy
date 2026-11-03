import type { Offer } from './offer'

export type ProductCategory =
  | 'shirts'
  | 'jeans'
  | 'formalShoes'
  | 'backpacks'
  | 'earphones'
  | 'watches'
  | 'raincoats'
  | 'helmets'

export type ProductSort = 'price' | 'rating' | 'discount'
export type PriceVerdict = 'buyNow' | 'wait'

export interface PlatformPrice {
  platform: string
  price: number
  mrp: number
  discountPercent: number
  inStock: boolean
  deliveryDays: number
  /** ISO date the order would arrive if placed now. */
  deliveryBy: string
  sponsored: boolean
  isCheapest: boolean
}

export interface ProductSummary {
  id: string
  name: string
  brand: string
  category: ProductCategory
  categoryLabel: string
  lowestPrice: number
  highestPrice: number
  mrp: number
  discountPercent: number
  rating: number
  reviewCount: number
  cheapestPlatform: string
  fastestDeliveryDays: number
  thumbnailSeed: number
  sponsored: boolean
}

export interface ProductDetail extends ProductSummary {
  description: string
  highlights: string[]
  platforms: PlatformPrice[]
  verdict: PriceVerdict
  verdictReason: string
  lowest90Day: number
  highest90Day: number
  average90Day: number
  /** How far today's lowest price sits above the 90-day low; 0 means it is the low. */
  aboveLowest90Day: number
  bestOffer: Offer | null
  /** The platform where price after the best offer is lowest. */
  bestDealPlatform: string
  /** That platform's price before the offer. */
  bestDealBasePrice: number
  finalPrice: number
  offerSaving: number
  /** finalPrice against MRP, so the UI never subtracts. */
  totalSavingVsMrp: number
  hasAlert: boolean
  alertTargetPrice: number | null
}

export interface PricePoint {
  date: string
  prices: Record<string, number>
}

export interface PriceHistory {
  productId: string
  days: number
  platforms: string[]
  points: PricePoint[]
  lowest: number
  highest: number
  average: number
  currentLowest: number
  summary: string
}

export interface PriceAlert {
  id: string
  productId: string
  productName: string
  targetPrice: number
  currentPrice: number
  /** How much further the price must fall to hit the target; 0 once triggered. */
  gapToTarget: number
  triggered: boolean
  createdAt: string
}

export interface ProductFilters {
  q?: string
  category?: ProductCategory | 'all'
  maxPrice?: number
  sort?: ProductSort
  page?: number
  pageSize?: number
}

export interface SetPriceAlertRequest {
  targetPrice: number
}
