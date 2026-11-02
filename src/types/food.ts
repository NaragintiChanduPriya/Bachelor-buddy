export type FoodPlaceType = 'darshini' | 'mess' | 'tiffin' | 'restaurant'
export type FoodSort = 'price' | 'distance' | 'rating'
export type NearAnchor = 'home' | 'office'

export interface MenuItem {
  id: string
  name: string
  price: number
  veg: boolean
  popular: boolean
}

export interface FoodListingSummary {
  id: string
  name: string
  type: FoodPlaceType
  areaId: string
  areaName: string
  veg: boolean
  rating: number
  reviewCount: number
  priceMin: number
  priceMax: number
  avgMealPrice: number
  distanceFromHomeKm: number
  distanceFromOfficeKm: number
  tags: string[]
  openNow: boolean
  timings: string
  thumbnailSeed: number
  sponsored: boolean
  monthlyPlanPrice: number | null
}

export interface FoodListing extends FoodListingSummary {
  description: string
  address: string
  menu: MenuItem[]
  openingTime: string
  closingTime: string
  deliveryAvailable: boolean
}

export interface FoodFilters {
  area?: string
  near?: NearAnchor
  maxPrice?: number
  type?: FoodPlaceType | 'all'
  veg?: boolean
  sort?: FoodSort
  page?: number
  pageSize?: number
}

export interface DeliveryFeeBreakdown {
  platform: string
  itemPrice: number
  deliveryFee: number
  platformFee: number
  packagingFee: number
  taxes: number
  total: number
}

export interface DeliveryComparison {
  listingId: string
  listingName: string
  dish: string
  dineInPrice: number
  cheapestDelivery: DeliveryFeeBreakdown
  deliveryOptions: DeliveryFeeBreakdown[]
  amountSaved: number
  percentSaved: number
  monthlySavingIfSwitched: number
}
